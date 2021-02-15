class homePage {

    open(path){
        browser.url(path);
    }
    
    linkClick(link){
        if($('//a[text()="'+link+'"]').waitForEnabled()==true){
        $('//a[text()="'+link+'"]').click();
        browser.getUrl();
    }

    }
}