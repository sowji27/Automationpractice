@account
Feature: Account Page

Scenario: Navigate to my account page 
  Given I have clicked the 'Sign in' link 
  When I enter 'lsowjanya@hotmail.com' in the 'Email address' field
  And I enter 'Shruti27' in the 'Password' field 
  And I click the 'Sign in' button
  Then the 'my account' text is displayed 

  

