$(onloadFunction);

function onloadFunction() {
    $.get("datasets.php", function(data, status){
        //alert("Data: " + data + "\nStatus: " + status);
        html ="";
        result = jQuery.parseJSON(data);
        for (var i in result) {
            dataset = result[i];
            html += formDatasetCard(dataset);
        }
        
        $('#datasetsContainer').html(html);
    });
}

function formDatasetCard(dataset) {
    datasetDetailsURL = 'singleDataset.html?di=' + dataset['id'] ;
    return '<div class="datasetCard">' + 
                '<div >'+
                    '<div class="datasetImageContainer">' + 
                        '<img class="datasetImage" src="' + dataset['pic_url'] +'" alt="Card image cap">'+
                    '</div>'+
                    '<div class="datasetContentContainer">'+
                        '<h4 class="card-title"><a href="' + datasetDetailsURL + '">' + dataset['title'] + '</a></h4>' + 
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