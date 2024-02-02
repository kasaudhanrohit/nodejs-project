(function () {
    var dom, doc, where, iframe = document.createElement('iframe');
    iframe.src = "javascript:false";
    (iframe.frameElement || iframe).style.cssText = "width:0;height:0;border:0;display:none;";
    if (document.body) {
        where = document.body.getElementsByTagName('script')[0];
        document.body.appendChild(iframe, where);
    } else {
        where = document.getElementsByTagName('script')[0];
        where.parentNode.insertBefore(iframe, where);
    }

    try {
        doc = iframe.contentWindow.document;
    } catch (e) {
        dom = document.domain;
        iframe.src = "javascript:var d=document.open();d.domain='" + dom + "';void(0);";
        doc = iframe.contentWindow.document;
    }
    function getQ() {
        //query for script like nv_bootstrap.
        var s = null;
        if (document.querySelector) { s = document.querySelector('[src*="nv_bootstrap"]'); }
        if (!s) {
            s = document.getElementsByTagName('script');
            for (var z = 0; z < s.length; z++) {
                if (s[z].src && s[z].src.indexOf('nv_bootstrap') >= 0) {
                    s = s[z]; break;
                }
            }
        }
        var qmap = {};
        if (s && s.src && s.src.indexOf('?') > 0) {
            var str = s.src.substr(s.src.indexOf('?') + 1);
            var qarr = str.split("&");
            var ci;
            for (var i = 0; i < qarr.length; i++) {
                ci = qarr[i].indexOf('=');
                qmap[qarr[i].substr(0, ci)] = qarr[i].substr(ci + 1);
            }
        }
        return qmap;
    }
    doc.open()._l = function () {
        var js = this.createElement("script");
        if (dom) this.domain = dom;
        var src = 'http://localhost:3000/cav_nv.js';
        js.id = "boomr-if-as";
        /*TODO: modify nv-server*/
        js.async = true;
        //check if version given then set that globally and add that version in each request.
        var qmap = getQ();
        var v = qmap['v'];
        //TODO: sessionStorage library here also??
        if (window.localStorage) {
            var ver = JSON.parse(window.localStorage.getItem('_nvLibVer'));
            if (ver && ver.cv != '0') v = ver.cv;
        }
        if (v) {
            src = src + "?v=" + v;
            window.top.__nv_agent_version = v;
        }
        var vv = qmap['childIframe'];
        if (vv == 'true') {
            cav_iframe = true;
        }
        // src should be set only once, otherwise ie makes request each time src is set
        js.src = src;
        this.body.appendChild(js);
    };
    doc.write('<body onload="document._l();">');
    doc.close();
})();
