var {Before, Given, When, Then} = require('cucumber');
//let accountPage = require('..PageObjects/accountPage');
//let homePage = require('../PageObjects/homepage');
//const { expect } = require('chai');

Before(function(){
    browser.url("http://automationpractice.com/");
});

Given (/^I have clicked the '([^"]*)' link$/, function(link){    
    var list = {"Sign in": "login"}
    $("a[class='" + list[link] + "']").click();
});

When(/^I enter '([^"]*)' in the '([^"]*)' field$/, function(text, field) {
     $("//input[@id='email']").setValue("lsowjanya@hotmail.com");
    
});

When(/^I enter '([^"]*)' in the '([^"]*)' field$/, function() {
    $("//input[@id='passwd']").setValue("Shruti27");
});

When(/^I have clicked the '([^"]*)' button$/, function(){
    $("//btn[@id='Sign in']").click();
});

Then(/^The '([^"]*)' page is displayed$/, function(){
    var strUrl=browser.getUrl();
    console.log("URL is : "+strUrl); 
});


//[@class='login']