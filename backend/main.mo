import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

// Apply migration with `with`, no other changes needed
(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type Class = {
    #eleventh;
    #twelfth;
    #dropper;
  };

  type UserProfile = {
    fullName : Text;
    userClass : Class;
    contactNumber : Nat;
    hasVisitedAdmin : Bool;
  };

  type Answer = {
    questionId : Nat;
    selectedOption : Text;
  };

  type TestResult = {
    userId : Principal;
    testId : Nat;
    answers : [Answer];
    score : Nat;
    submittedAt : Time.Time;
  };

  type Question = {
    id : Nat;
    image : Storage.ExternalBlob;
    correctOption : Text;
  };

  type CompleteTest = {
    id : Nat;
    name : Text;
    durationMinutes : Nat;
    isPublished : Bool;
    questions : [Question];
  };

  // userId -> profile
  let userProfiles = Map.empty<Principal, UserProfile>();
  // questionId -> question
  let questions = Map.empty<Nat, Question>();
  // testId -> completeTest
  let completeTests = Map.empty<Nat, CompleteTest>();
  // resultIndex -> testResult
  let testResultsStore = Map.empty<Nat, TestResult>();

  var nextTestId = 1;
  var nextQuestionId = 1;
  var nextResultId = 1;

  // ─── Required profile functions per instructions ───────────────────────────

  /// Get the calling user's own profile. Requires #user role.
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    userProfiles.get(caller);
  };

  /// Save the calling user's own profile. Requires #user role.
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    validateProfile(profile);
    userProfiles.add(caller, profile);
  };

  /// Get another user's profile. Caller must be the same user or an admin.
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ─── User registration / profile management ────────────────────────────────

  /// Register a new user profile. Requires #user role (must be authenticated).
  public shared ({ caller }) func registerUser(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can register");
    };
    validateProfile(profile);
    userProfiles.add(caller, profile);
  };

  /// Update the calling user's profile. Requires #user role.
  public shared ({ caller }) func updateProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update their profile");
    };
    validateProfile(profile);
    userProfiles.add(caller, profile);
  };

  /// Get the calling user's profile. Requires #user role.
  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    userProfiles.get(caller);
  };

  /// Mark that the admin has been visited by the caller (admin only).
  public shared ({ caller }) func markAdminVisited() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can mark admin as visited");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Profile not found");
      };
      case (?profile) {
        let updated = {
          profile with
          hasVisitedAdmin = true;
        };
        userProfiles.add(caller, updated);
      };
    };
  };

  /// Check if the caller has visited the admin.
  public query ({ caller }) func hasAdminBeenVisited() : async Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.hasVisitedAdmin };
    };
  };

  // ─── Test submission / results ─────────────────────────────────────────────

  /// Submit a test result. Requires #user role.
  public shared ({ caller }) func submitTestResult(testId : Nat, answers : [Answer], score : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can submit test results");
    };
    let test = switch (completeTests.get(testId)) {
      case (null) { Runtime.trap("Test not found") };
      case (?t) { t };
    };
    if (not test.isPublished) {
      Runtime.trap("Test is not published");
    };
    let result : TestResult = {
      userId = caller;
      testId;
      answers;
      score;
      submittedAt = Time.now();
    };
    testResultsStore.add(nextResultId, result);
    nextResultId += 1;
  };

  /// Get the calling user's own test results. Requires #user role.
  public query ({ caller }) func getMyResults() : async [TestResult] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their results");
    };
    testResultsStore.values().toArray().filter(
      func(r : TestResult) : Bool { r.userId == caller }
    );
  };

  // ─── Public test queries (any authenticated user) ──────────────────────────

  /// Get all published tests. Requires #user role.
  public query ({ caller }) func getPublishedTests() : async [CompleteTest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view published tests");
    };
    completeTests.values().toArray().filter(
      func(t : CompleteTest) : Bool { t.isPublished }
    );
  };

  /// Get a test by ID. Non-admins can only access published tests.
  public query ({ caller }) func getTestById(testId : Nat) : async CompleteTest {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view tests");
    };
    switch (completeTests.get(testId)) {
      case (null) { Runtime.trap("Test not found") };
      case (?test) {
        if (not test.isPublished and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Test is not published");
        };
        test;
      };
    };
  };

  // ─── Admin: Question management ────────────────────────────────────────────

  /// Add a new question. Admin only.
  public shared ({ caller }) func addQuestion(image : Storage.ExternalBlob, correctOption : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add questions");
    };
    let questionId = nextQuestionId;
    let newQuestion : Question = {
      id = questionId;
      image;
      correctOption;
    };
    questions.add(questionId, newQuestion);
    nextQuestionId += 1;
    questionId;
  };

  /// Update an existing question. Admin only.
  public shared ({ caller }) func updateQuestion(questionId : Nat, image : Storage.ExternalBlob, correctOption : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update questions");
    };
    switch (questions.get(questionId)) {
      case (null) { Runtime.trap("Question not found") };
      case (?_) {
        let updated : Question = {
          id = questionId;
          image;
          correctOption;
        };
        questions.add(questionId, updated);
      };
    };
  };

  /// Delete a question. Admin only.
  public shared ({ caller }) func deleteQuestion(questionId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete questions");
    };
    switch (questions.get(questionId)) {
      case (null) { Runtime.trap("Question not found") };
      case (?_) { questions.remove(questionId) };
    };
  };

  /// Get all questions. Admin only.
  public query ({ caller }) func getAllQuestions() : async [Question] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all questions");
    };
    questions.values().toArray();
  };

  // ─── Admin: Test management ────────────────────────────────────────────────

  /// Create a new test. Admin only.
  public shared ({ caller }) func createTest(name : Text, durationMinutes : Nat, questionIds : [Nat]) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create tests");
    };
    if (name.size() == 0) { Runtime.trap("Test name cannot be empty") };
    if (durationMinutes == 0) { Runtime.trap("Duration must be greater than 0") };

    let questionsList = List.empty<Question>();
    for (id in questionIds.values()) {
      switch (questions.get(id)) {
        case (?question) { questionsList.add(question) };
        case (null) {
          Runtime.trap("Question not found: " # Nat.toText(id));
        };
      };
    };
    let questionsArray = questionsList.toArray();
    if (questionsArray.size() == 0) {
      Runtime.trap("Test must have at least 1 question");
    };

    let testId = nextTestId;
    let newTest : CompleteTest = {
      id = testId;
      name;
      durationMinutes;
      isPublished = false;
      questions = questionsArray;
    };
    completeTests.add(testId, newTest);
    nextTestId += 1;
    testId;
  };

  /// Update an existing test. Admin only.
  public shared ({ caller }) func updateTest(testId : Nat, name : Text, durationMinutes : Nat, questionIds : [Nat]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update tests");
    };
    switch (completeTests.get(testId)) {
      case (null) { Runtime.trap("Test not found") };
      case (?existing) {
        if (name.size() == 0) { Runtime.trap("Test name cannot be empty") };
        if (durationMinutes == 0) { Runtime.trap("Duration must be greater than 0") };

        let questionsList = List.empty<Question>();
        for (id in questionIds.values()) {
          switch (questions.get(id)) {
            case (?question) { questionsList.add(question) };
            case (null) {
              Runtime.trap("Question not found: " # Nat.toText(id));
            };
          };
        };
        let questionsArray = questionsList.toArray();
        if (questionsArray.size() == 0) {
          Runtime.trap("Test must have at least 1 question");
        };

        let updated : CompleteTest = {
          id = testId;
          name;
          durationMinutes;
          isPublished = existing.isPublished;
          questions = questionsArray;
        };
        completeTests.add(testId, updated);
      };
    };
  };

  /// Toggle publish/unpublish a test. Admin only.
  public shared ({ caller }) func togglePublishTest(testId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can publish/unpublish tests");
    };
    switch (completeTests.get(testId)) {
      case (null) { Runtime.trap("Test not found") };
      case (?test) {
        let updated : CompleteTest = {
          test with
          isPublished = not test.isPublished;
        };
        completeTests.add(testId, updated);
      };
    };
  };

  /// Get all tests (published and unpublished). Admin only.
  public query ({ caller }) func getAllTests() : async [CompleteTest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all tests");
    };
    completeTests.values().toArray();
  };

  // ─── Admin: User management ────────────────────────────────────────────────

  /// Get all registered users. Admin only.
  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.toArray();
  };

  // ─── Admin: Results management ─────────────────────────────────────────────

  /// Get all test results. Admin only.
  public query ({ caller }) func getAllResults() : async [TestResult] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all results");
    };
    testResultsStore.values().toArray();
  };

  // ─── Private helpers ───────────────────────────────────────────────────────

  private func validateProfile(profile : UserProfile) {
    if (profile.fullName.size() < 3) {
      Runtime.trap("Full name must be at least 3 characters");
    };
    if (profile.contactNumber < 1000000000 or profile.contactNumber > 9999999999) {
      Runtime.trap("Contact number must be a valid 10-digit number");
    };
  };
};

