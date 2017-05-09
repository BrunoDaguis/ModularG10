/*var options = {
    method: null,
    url: null,
    data: null,
    beforeSend: function () { },
    success: function (response) { },
    complete: function () { },
    error: function(error){}
}*/

//var optionCurrent = null;

var ajax = {
    send: function (options) {
        var optionCurrent = options;

        $.ajax({
            "type": optionCurrent.method,
            "url": optionCurrent.url,
            "data":  optionCurrent.data,
            "contentType": "application/json; charset=utf-8",
            "dataType": "json",
            "cache": false,
            "beforeSend": function () {
                
                options.beforeSend();
            },
            "success": function (json) {
                options.success(json);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                options.error(jqXHR);
            }, complete: function () {
                options.complete();
                //self.optionCurrent = null;
            }
        });
    }
}