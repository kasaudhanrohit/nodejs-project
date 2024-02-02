/**Specify your configuration **/
CAVNV.init({
    /*specify beacon url, eg. http://127.0.0.1/test_rum?timing=*/
    beacon_url: "http://localhost:3000/realuserinfo",
    site_domain: null,
    cssSelectorOptions: { class_blacklist: [], id_blacklist: [], prefix_tag: false, attribute_blacklist: [], attribute_whitelist: [] },
    resourceTiming: true,
    visitorInfo: true,
    maxSessionDuration: 7200,
    sessionExpiry: 1800,
    /* specify pagedump url. eg. http://127.0.0.1/test_rum?pagedump= */
    //pagedump_url: "//10.10.30.78:7909/test_rum?pagedump=",
    BW: {
        enable: false
    },
    CONFIG: {
        //config_url: "//10.10.30.78:7909/nv/netvision/config.js",
        pageUrlValues: [
            { s: 0, c: /(INDEX)/ },
            { s: 1, c: /(WELCOME)/ },
            { s: 2, c: /(RESERVATION)/ },
            { s: 3, c: /(LOGIN)/ },
            { s: 4, c: /(HOME)/ },
            { s: 5, c: /(FINDFLIGHT)/ }
        ]
        /****Uncomment for Kohls***
        pageGroupName : [
         {s: 0, c: 'shippingBilling'},
         {s: 1, c: 'giftOption'},
         {s: 2, c: 'placeOrder'},
         {s: 3, c: 'payment'},
         {s: 4, c: 'orderSuccess'},
         {s: 5, c: 'shoppingCart'},
         {s: 6, c: 'pdpPage'},
         {s: 7, c: 'productList'},
         {s: 8, c: 'shoppingCartV2'},
         {s: 9, c: 'homePage'},
         {s: 10, c: 'sale_event'},
         {s: 11, c: 'Generic_Content'},
         {s: 12, c: 'CollectionPDPPage'},
         {s: 13, c: 'deptPage'},
         {s: 14, c: 'productMatrixPage'},
         {s: 15, c: 'regularProductPage'}
       ],
       ****/
        /*this is the variable name which will be given in web pages.*/
        //pageGroupVar: 'CAV_PG_VAR'

    },
    USERACTION: {
        //jquery_url: "//127.0.0.1/jquery.js",
        enabled: true,
        pluginjs_url: "//10.10.30.78:7909/nv/netvision/cavua.js"
    },
    FEEDBACK: {
        enabled: true,
        feedbackPosition: "bottom",
        //pluginfbjs_url: "//10.10.30.78:7909/nv/netvision/feedback_Default/feedback.js",
        nvmail_url: "//<NV-GUI-IP>/netvision/reports/nvfeedbackmail.jsp",
        nvreplaysession_url: "http://<NV-GUI-IP>/netvision/getSessionReplayLink",
        ssType: { t: 'image/jpeg', q: 0.3 }
    },
    DOMWATCHER2: {
        enabled: true,
        elementList: [
            { 'name': 'error container', 'selector': 'errorContainer', 'selectorType': 'id', 'page': '1,2,3' }
        ]
    },
    pagedump_mode: 2, //this can be either 0(disable), 1(plain), 2(compressed)
    /*user_ip: "<%=request.getRemoteAddr()%>"*/
    log_level: 1,
    blacklist_id: [],
    customMetrics: [{ 'name': 'sessionID', 'id': 1, 'type': 'text' }],
    blacklistCookies: [],
    whitelistCookies: [],
    enableWorker: true,
    autoNDInstr: {
        enable: false //,
        /*filter: 50,
        events: [{e: ajaxError, g: 12}, {e: SessionFailure}] */
    },
    CrossOrigin: {
        enabled: false,
        frame_url: "//10.10.30.78:7909/nv/netvision/nv_cross_origin.html",
        group: "GROUPNAME"
    },
    ABTesting: {
        enabled: false,
        v: [
            {
                i: 3,/*variationId*/
                pi: "0,1,2",//<list of pageid>,
                pct: 10,
                url: "http://10.10.60.16:9002/tours/welcome.html",
                r: /*rule*/
                {
                    //"cssrule": '',
                    /*"htmlrule": "",*/
                    "jsrule": "$('.toggle_location').html('Changed Content');"
                },
                g: /*goal*/{
                    id: 1,
                    type: "PAGE_GOAL",
                    mode: "URL_CONTAIN",
                    v2: "index.html"/*,
           v1:*/
                }
            }
        ]
    },
    MonitorConsole: {
        enabled: true,
        level: ['error', 'warn', 'info', 'verbose'],
        maxLog: 100,
        maxError: 100,
        maxLogLength: 256,
        filter: {
            pct: 50,
            blacklistPattern: []
        }
    },
    FA: {
        enabled: true,
        blackList: [{ form: "form1", pageid: 1 }, { form: /(ide_[0-9])/, pageid: 2 }, { field: "name123", pageid: 2 }, { field: /(ide_[0-9])/, pageid: 2 }]
    }
});

