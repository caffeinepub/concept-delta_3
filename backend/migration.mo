import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

module {
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
    userId : Principal.Principal;
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

  type OldActor = {
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    questions : Map.Map<Nat, Question>;
    completeTests : Map.Map<Nat, CompleteTest>;
    testResultsStore : Map.Map<Nat, TestResult>;
    nextTestId : Nat;
    nextQuestionId : Nat;
    nextResultId : Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
    questions : Map.Map<Nat, Question>;
    completeTests : Map.Map<Nat, CompleteTest>;
    testResultsStore : Map.Map<Nat, TestResult>;
    nextTestId : Nat;
    nextQuestionId : Nat;
    nextResultId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    // No actual state change needed
    old;
  };
};
