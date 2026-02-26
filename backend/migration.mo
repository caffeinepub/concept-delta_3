import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type Class = {
    #eleventh;
    #twelfth;
    #dropper;
  };
  type OldUser = {
    fullName : Text;
    userClass : Class;
    contactNumber : Nat;
  };
  type OldActor = {
    userProfiles : Map.Map<Principal, OldUser>;
    questions : Map.Map<Nat, Question>;
    completeTests : Map.Map<Nat, CompleteTest>;
    testResultsStore : Map.Map<Nat, TestResult>;
    nextTestId : Nat;
    nextQuestionId : Nat;
    nextResultId : Nat;
  };
  type NewUser = {
    fullName : Text;
    userClass : Class;
    contactNumber : Nat;
    hasVisitedAdmin : Bool;
  };
  type NewActor = {
    userProfiles : Map.Map<Principal, NewUser>;
    questions : Map.Map<Nat, Question>;
    completeTests : Map.Map<Nat, CompleteTest>;
    testResultsStore : Map.Map<Nat, TestResult>;
    nextTestId : Nat;
    nextQuestionId : Nat;
    nextResultId : Nat;
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
    submittedAt : Int;
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

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUser, NewUser>(
      func(_id, oldUser) {
        {
          oldUser with
          hasVisitedAdmin = false;
        };
      }
    );
    {
      old with
      userProfiles = newUserProfiles;
    };
  };
};
