import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import List "mo:core/List";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";



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
    score : Nat; // Number of correct answers
    marks : Int; // Total marks considering correct and negative marking
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
    marksPerCorrect : Int; // Marks for each correct answer
    negativeMarks : Int; // Marks deducted for each wrong answer
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let questions = Map.empty<Nat, Question>();
  let completeTests = Map.empty<Nat, CompleteTest>();
  let testResultsStore = Map.empty<Nat, TestResult>();

  var nextTestId = 1;
  var nextQuestionId = 1;
  var nextResultId = 1;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    validateProfile(profile);
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func registerUser(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can register");
    };
    validateProfile(profile);
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func updateProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update their profile");
    };
    validateProfile(profile);
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    userProfiles.get(caller);
  };

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

  public query ({ caller }) func hasAdminBeenVisited() : async Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.hasVisitedAdmin };
    };
  };

  public shared ({ caller }) func submitTestResult(testId : Nat, answers : [Answer]) : async () {
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

    let (score, marks) = calculateScore(answers, test.questions, test.marksPerCorrect, test.negativeMarks);
    let result : TestResult = {
      userId = caller;
      testId;
      answers;
      score; // Number of correct answers
      marks; // Total marks with deduction for wrong answers
      submittedAt = Time.now();
    };

    testResultsStore.add(nextResultId, result);
    nextResultId += 1;
  };

  // Calculate score and marks considering test configuration
  private func calculateScore(answers : [Answer], testQuestions : [Question], marksPerCorrect : Int, negativeMarks : Int) : (Nat, Int) {
    var score = 0;
    var marks : Int = 0;

    for (answer in answers.values()) {
      var found = false;
      var i = 0;
      while (i < testQuestions.size() and not found) {
        let question = testQuestions[i];
        if (question.id == answer.questionId) {
          found := true;
          if (Text.equal(answer.selectedOption, question.correctOption)) {
            score += 1;
            marks += marksPerCorrect;
          } else {
            marks -= negativeMarks;
          };
        };
        i += 1;
      };
    };
    (score, marks);
  };

  public query ({ caller }) func getMyResults() : async [TestResult] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their results");
    };
    testResultsStore.values().toArray().filter(
      func(r : TestResult) : Bool { r.userId == caller }
    );
  };

  public query ({ caller }) func getPublishedTests() : async [CompleteTest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view published tests");
    };
    completeTests.values().toArray().filter(
      func(t : CompleteTest) : Bool { t.isPublished }
    );
  };

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

  public shared ({ caller }) func deleteQuestion(questionId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete questions");
    };
    switch (questions.get(questionId)) {
      case (null) { Runtime.trap("Question not found") };
      case (?_) { questions.remove(questionId) };
    };
  };

  public query ({ caller }) func getAllQuestions() : async [Question] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all questions");
    };
    questions.values().toArray();
  };

  public shared ({ caller }) func createTest(name : Text, durationMinutes : Nat, questionIds : [Nat], marksPerCorrect : Int, negativeMarks : Int) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create tests");
    };
    if (name.size() == 0) { Runtime.trap("Test name cannot be empty") };
    if (durationMinutes == 0) { Runtime.trap("Duration must be greater than 0") };

    // Validate marksPerCorrect and negativeMarks
    if (marksPerCorrect < 0) { Runtime.trap("Marks per correct answer must be non-negative") };
    if (negativeMarks < 0) { Runtime.trap("Negative marks must be non-negative") };

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
      marksPerCorrect;
      negativeMarks;
    };
    completeTests.add(testId, newTest);
    nextTestId += 1;
    testId;
  };

  public shared ({ caller }) func updateTest(testId : Nat, name : Text, durationMinutes : Nat, questionIds : [Nat], marksPerCorrect : Int, negativeMarks : Int) : async () {
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

        // Validate marksPerCorrect and negativeMarks
        if (marksPerCorrect < 0) { Runtime.trap("Marks per correct answer must be non-negative") };
        if (negativeMarks < 0) { Runtime.trap("Negative marks must be non-negative") };

        let updated : CompleteTest = {
          id = testId;
          name;
          durationMinutes;
          isPublished = existing.isPublished;
          questions = questionsArray;
          marksPerCorrect;
          negativeMarks;
        };
        completeTests.add(testId, updated);
      };
    };
  };

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

  public query ({ caller }) func getAllTests() : async [CompleteTest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all tests");
    };
    completeTests.values().toArray();
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, UserProfile)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.toArray();
  };

  public query ({ caller }) func getAllResults() : async [TestResult] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view all results");
    };
    testResultsStore.values().toArray();
  };

  private func validateProfile(profile : UserProfile) {
    if (profile.fullName.size() < 3) {
      Runtime.trap("Full name must be at least 3 characters");
    };
    if (profile.contactNumber < 1000000000 or profile.contactNumber > 9999999999) {
      Runtime.trap("Contact number must be a valid 10-digit number");
    };
  };
};

