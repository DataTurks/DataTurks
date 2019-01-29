$(onloadFunction);

function onloadFunction() {
    var datasetId = location.search.split('di=')[1] ? location.search.split('di=')[1] : null;
    if (datasetId == null || datasetId == '') {
        MakeErrorPage("No such page found");
        return;
    }
    
    $.get("datasets.php?di=" + datasetId, function(data, status){
        //alert("Data: " + data + "\nStatus: " + status);
        html ="";
        result = jQuery.parseJSON(data);
        //alert(JSON.stringify(result));
        //return;
        if (result.length > 0) {
            dataset = result[0];
            html += formDatasetDetails(dataset);
            $('#datasetsContainer').html(html);
        }
        
    });
}
function MakeErrorPage(msg) {
    alert(msg);
}

function formDatasetDetails(dataset) {

    return '<div class="datasetDetails">' + 
                '<div >'+
                    '<div class="datasetDeatilsImageContainer">' +
                        '<div class="overlayBox">' + 
                            '<img  src="' + dataset['pic_url'] +'" alt="Card image cap">'+
                            '<h4 class="card-title"><span>' + dataset['title'] + '</span></h4>' + 
                        '</div>'+
                    '</div>' +
                    '<div class="datasetDeatilsContentContainer">'+
                        '<p class="card-text">' +dataset['description'] +'</p>'+
                        '<a href="'+dataset['download_url'] +'" class="card-link">' + 'Download' + '</a>' +
                        '<span class="datasetzie">' + dataset['size'] + '</span>' +
                    '</div>'+
                '</div>'+
            '</div>';
}

function formDatasetCardHorizontal(dataset) {
    return '<div class="col s12 m7">' + 
                '<h4 class="header">Horizontal Card</h4>' + 
                '<div class="card horizontal">' +
                  '<div class="card-image">' +
                   ' <img src="http://lorempixel.com/100/190/nature/6">' +
                  '</div>'+
                  '<div class="card-stacked">'+
                    '<div class="card-content">'+
                     ' <p>I am a very simple card. I am good at containing small bits of information.</p>'+
                    '</div>'+
                    '<div class="card-action">'+
                    '  <a href="#">This is a link</a>'+
                   ' </div>'+
                  '</div>'+
                '</div>'+
            '</div>' 
    
}