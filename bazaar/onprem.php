<!DOCTYPE html>
        <html lang="en">
        <head>
        
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="description" content="">
            <meta name="author" content="">
            
            <!--<meta property="fb:app_id"          content="302055306912733" /> -->
            <meta property="og:type" content="article"/> 
            <meta property="og:title" content="Best online platform for your ML data annotation needs."/>
            <meta property="og:image" content="https://storage.googleapis.com/bonsai-b808c.appspot.com/dataturks/website/machine-learning-api.jpeg"/> 
            <!---<meta property="og:image:width"           content="1200" /> 
            <meta property="og:image:height"           content="630" /> -->
            <meta property="og:description" content="Just upload your data, invite your team members and start tagging. The best way to tag training/evaluation data for your machine learning projects."/>
            
            <title>Dataturks – Online tool to build Image Bounding Box, NER, NLP and other ML datasets.</title>
            <link rel="icon" type="image/png" href="/img/xdataturks_icon.png.pagespeed.ic.BmDiJPJ9lq.webp">
        
            
            <!-- Bootstrap Core CSS -->
            <!--<link href="/vendor/bootstrap/css/A.bootstrap.min.css.pagespeed.cf.ANNqluioKf.css" rel="stylesheet">
        -->
            <link rel="stylesheet" href="/css/bootstrap4.min.css" >
            
            <!-- Custom CSS -->
            <!--<link href="/css,_datasets.css+vendor,_font-awesome,_css,_font-awesome.min.css.pagespeed.cc.eLdahmyhAP.css" rel="stylesheet"/>
            -->
            <link rel="stylesheet" href="/css/datasets.css" >
            <link rel="stylesheet" href="vendor/font-awesome/css/font-awesome.css" >
            
            
            <script src="js/jquery-3.3.1.min.js"></script>
            <script src="js/popper.min.js"></script>
            <script src="js/bootsrap4.min.js"></script>
            <script src="js/jquery-ui.min.js"></script>
            
            
            
            <!-- Custom Fonts -->
            <!--
            <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,700,300italic,400italic,700italic" rel="stylesheet" type="text/css">
        -->
            <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
            <!-- WARNING: Respond.js doesnt work if you view the page via file:// -->
            <!--[if lt IE 9]>
                <!--<script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
                <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
                -->
                
            <!-- Global site tag (gtag.js) - Google Analytics -->
            <script async src="https://www.googletagmanager.com/gtag/js?id=UA-110079535-1"></script>




<body id="top" data-spy="scroll" data-target=".ngoNavBar" data-offset="50" >
 <nav class="navbar navbar-default navbar-custom">
      <div class="container-fluid ">
        <div class="navbar-header ">
          <!--<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#pageNavBar">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>                        
          </button>-->
          <a class="navbar-brand navbar-brand-imp" href="#">Dataturks</a>
        </div>
        <!--<div class="collapse navbar-collapse" id="pageNavBar">
        <ul class="nav navbar-nav navbar-right">
          
          <li class="dropdown">
            <a href="#" class="dropdown-toggle noBorderLine" data-toggle="dropdown"><h6>Products</h6></a>
            <ul class="dropdown-menu teal-dropdown">
                <li><a href="/features/image-bounding-box.php"><h6>Image Annotation</h6></a></li>
                <li class="divider"></li>
                <li><a href="/features/document-ner-annotation.php"><h6>Text Annotation</h6></a></li>
            </ul>
          </li>
          <li><a href="/pricing.php"><h6>Pricing</h6></a></li>
          <li><a href="https://docs.dataturks.com/" target="_blank"><h6>API</h6></a></li>
          <li><a href="/projects/login"><h6>Signup</h6></a></li>
          
        </ul>
        </div>-->
      </div>
    </nav>
    
    
    <!--+++++++++++++++++++++Page contents starts ++++++++++++++++++++++++++++++++++++++++++-->

    
    <div class="container ">
        <div class="row text-left marginTopExtraExtra">
          <div class="col-md-4 col-md-offset-5 marginTop">
            <div><a href="/projects/login" class="dt_button3">Login <i class="fa fa-caret-right" aria-hidden="true"></i></a></div>
          </div>
        </div>
        
        <div class="row text-left marginTopExtraExtra">
          <div class="col-md-4 col-md-offset-5 marginTopExtraExtra">
            <a href="#"  id="setup" class="dt_button">Admin Setup <i class="fa fa-caret-right" aria-hidden="true"></i></a>
            <div id="licenseSuccess" class="text-success" style="display: none">License updated successfully!</div>
            <div id="licenseError"  style="display: none"></div>
            
          </div>
        </div>
        
        
        
        <div class="row text-left marginTop " id="license" style="display: none">
          <div class="col-md-4 col-md-offset-5 ">
            
            <form>
              <div class="form-group">
                <label for="license">License</label>
                <textarea type="text" rows="3" class="form-control" id="licenseVal" aria-describedby="licenseHelp" placeholder="Enter License"></textarea>
                <small id="licenseHelp" class="form-text text-muted">Copy paste your Dataturks License.</small>
              </div>
              <button type="submit" class="btn btn-primary" id="licenseSubmit" >Submit</button>
            </form>
            
            <div class="marginTopExtraExtra" ></div>
          </div>
        </div>
        
        
        <div class="row text-left marginTop">
          <div class="col-md-5 col-md-offset-5 ">
            <a href="#"  id="changePasswordButton" class="dt_button">Change Password <i class="fa fa-caret-right" aria-hidden="true"></i></a>
            <div id="changePasswordSuccess" class="text-success" style="display: none">Password changed successfully!</div>
            <div id="changePasswordError" class="text-danger" style="display: none"></div>
            
          </div>
        </div>
        
        <div class="row text-left marginTop" id="changePassword" style="display: none">
          <div class="col-md-4 col-md-offset-5 ">
            
            <form>
              <div class="form-group">
                <label for="changePasswordEmail">Email address</label>
                <input type="email" class="form-control" id="changePasswordEmail" aria-describedby="emailHelp" placeholder="Enter email">
                <small id="emailHelp" class="form-text text-muted">For the account you want to change the password for.</small>
              </div>
              <div class="form-group">
                <label for="changePasswordPassword">New Password</label>
                <input type="password" class="form-control" id="changePasswordPassword" placeholder="New Password">
              </div>
              <div class="form-group">
                <label for="license">License (for verification)</label>
                <textarea type="text" rows="3" class="form-control" id="changePasswordLicenseVal" aria-describedby="licenseHelp" placeholder="Enter License"></textarea>
                <small id="licenseHelp" class="form-text text-muted">Copy paste your cuurent Dataturks License.</small>
              </div>
              <button type="submit" class="btn btn-primary" id="changePasswordSubmit" >Submit</button>
            </form>
            
            <div class="marginTopExtraExtra" ></div>
          </div>
        </div>
        
        
        
    </div>
    
    
    
<footer class="footer marginTopExtraExtra">
       <div class="container">
        
           <div class="row">
                
                <div class="col-lg-3 col-md-3 col-md-offset-1"><!-- widgets column left -->
                    <ul class="list-unstyled clear-margins"><!-- widgets -->
                        <li class="widget-container widget_nav_menu"><!-- widgets list -->
                            <h5 class="title-widget">About</h5>
                            <ul>
                                <li><a href="https://dataturks.com/index.php" target="_blank"><i class="fa fa-angle-right"></i> About</a></li>
                                <li><a href="https://dataturks.com/help/help.php" target="_blank"><i class="fa fa-angle-right"></i> Help</a></li>
                            </ul>
                        </li>        
                    </ul>   
                </div><!-- widgets column left end -->
                
                <div class="col-lg-3 col-md-3 col-md-offset-1"><!-- widgets column left -->
                    <ul class="list-unstyled clear-margins"><!-- widgets -->
                        <li class="widget-container widget_nav_menu"><!-- widgets list -->
                            <h5 class="title-widget">Blog</h5>
                            <ul>
                                <li><a href="https://dataturks.com/blog/blog.php" target="_blank"><i class="fa fa-angle-right"></i> All posts</a></li>
                                <li><a href="https://dataturks.com/blog/compare-image-text-recognition-apis.php" target="_blank"><i class="fa fa-angle-right"></i> OCR APIs comparison</a></li>
                                <li><a href="https://dataturks.com/blog/face-verification-api-comparison.php" target="_blank"><i class="fa fa-angle-right"></i> Face reco APIs comparison.</a></li>
                                <li><a href="https://dataturks.com/blog/image-moderation-api-comparison.php" target="_blank"><i class="fa fa-angle-right"></i> Best image moderation APIs.</a></li>
                            
                            </ul>
                        </li>        
                    </ul>   
                </div><!-- widgets column left end -->
                
                <div class="col-lg-3 col-md-3 col-md-offset-1"><!-- widgets column left -->
                    <ul class="list-unstyled clear-margins"><!-- widgets -->
                        <li class="widget-container widget_nav_menu"><!-- widgets list -->
                            <h5 class="title-widget">How to</h5>
                            <ul>
                                <li><a href="https://dataturks.com/help/image-rectangle-bounding-box-annotation.php" target="_blank"><i class="fa fa-angle-right"></i> Image Bounding Box.</a></li>
                                <li><a href="https://dataturks.com/help/document-annotation-POS-NER.php" target="_blank"><i class="fa fa-angle-right"></i> Document Annotation.</a></li>
                                <li><a href="https://dataturks.com/help/image-polygon-bounding-box-annotation.php" target="_blank"><i class="fa fa-angle-right"></i> Polygon Bounding Box.</a></li>
                                <li><a href="https://dataturks.com/help/pos-text-annotations.php" target="_blank"><i class="fa fa-angle-right"></i> POS Tagging.</a></li>
                            
                            </ul>
                        </li>        
                    </ul>   
                </div><!-- widgets column left end -->
                
            </div>
            
            <div class="row marginTop">
                
                <div class="col-lg-3 col-md-3 col-md-offset-1"><!-- widgets column left -->
                    <ul class="list-unstyled clear-margins"><!-- widgets -->
                        <li class="widget-container widget_nav_menu"><!-- widgets list -->
                            <h5 class="title-widget">Features</h5>
                            <ul>
                                <li><a href="https://dataturks.com/features/image-bounding-box.php" target="_blank"><i class="fa fa-angle-right"></i> Image Annotations</a></li>
                                <li><a href="https://dataturks.com/features/document-ner-annotation.php" target="_blank"><i class="fa fa-angle-right"></i> Text Annotations</a></li>
                                <li><a href="https://docs.dataturks.com/" target="_blank"><i class="fa fa-angle-right" href="https://docs.dataturks.com/" target="_blank"></i> API Docs</a></li>
                            </ul>
                        </li>        
                    </ul>   
                </div><!-- widgets column left end -->
                
                <div class="col-lg-3 col-md-3 col-md-offset-1"><!-- widgets column left -->
                    <ul class="list-unstyled clear-margins"><!-- widgets -->
                        <li class="widget-container widget_nav_menu"><!-- widgets list -->
                            <h5 class="title-widget">Documentation</h5>
                            <ul>
                                <li><a href="https://dataturks.com/help/ibbx_dataturks_to_pascal_voc_format.php" target="_blank"><i class="fa fa-angle-right"></i> Export to Pascal VOC</a></li>
                                <li><a href="https://medium.com/dataturks/converting-dataturks-image-classifier-tools-output-to-tensorflow-format-6f569e085bf3" target="_blank"><i class="fa fa-angle-right"></i> Export in TensorFlow Format</a></li>
                                <li><a href="https://dataturks.com/help/dataturks-ner-json-to-spacy-train.php" target="_blank"><i class="fa fa-angle-right"></i> NER in Spacy Format</a></li>
                                <li><a href="https://dataturks.com/help/help.php" target="_blank"><i class="fa fa-angle-right"></i> Docs</a></li>
                               
                            </ul>
                        </li>        
                    </ul>   
                </div><!-- widgets column left end -->
                
                <div class="col-lg-3 col-md-3 col-md-offset-1"><!-- widgets column left -->
                    <ul class="list-unstyled clear-margins"><!-- widgets -->
                        <li class="widget-container widget_nav_menu"><!-- widgets list -->
                            <h5 class="title-widget">ML Tutorial</h5>
                            <ul>
                                <li><a href="https://dataturks.com/blog/intro-to-machine-learning-NER-deep-dive.php" target="_blank"><i class="fa fa-angle-right"></i> Introduction to ML</a></li>
                                <li><a href="https://medium.com/@dataturks/using-machine-learning-to-fight-cyber-trolls-9bf0fa1c5df9" target="_blank"><i class="fa fa-angle-right"></i> ML based troll filter</a></li>
                                <li><a href="https://medium.com/@dataturks/how-does-gdpr-impact-machine-learning-keystrokes-pascal-voc-and-much-more-1625b8a1147b" target="_blank"><i class="fa fa-angle-right"></i> ML and GDPR</a></li>
                                <li><a href="https://hackernoon.com/tensorflow-vs-keras-comparison-by-building-a-model-for-image-classification-f007f336c519" target="_blank"><i class="fa fa-angle-right"></i> TensorFlow vs Keras?</a></li>
                            </ul>
                        </li>        
                    </ul>   
                </div><!-- widgets column left end -->
                
                
                
            </div>
            
            
            <div class="row text-center">
                <div class="col-md-6 col-md-offset-3 text-center marginTop">
                    <hr class="small">
                    
                    <p class="text-muted">(+91) 080-331-72755, +91-99010-49915, +91-88614-08222</p>
                    <p class="text-muted">contact@dataturks.com</p>
                </div>
            </div>
            
            <div class="row">
                  
                  <div class="col-md-4 col-md-offset-8 text-center">
                    <p class="text-center title-widget" style="color:#fff"><strong>Say Hi:</strong></p>
                    <div class="text-right">
                        <ul class="social-network social-circle text-right">
                            <li><a href="https://www.facebook.com/Datatrks/" class="icoFacebook" title="Facebook" target="_blank"><i class="fa fa-facebook"></i></a></li>
                            <li><a href="https://twitter.com/dataturks" class="icoTwitter" title="Twitter" target="_blank"><i class="fa fa-twitter"></i></a></li>
                            <li><a href="https://aimlhandson.slack.com/join/shared_invite/enQtMzc0NTk0MzQ3Mzc2LWVlOWE5MzdmMTNjOWY3ODhjODI5ODAyZjgxMTE1MDNiZGMwYzk1NDNmNmQwYzhhNTE2NGY4NjQ2YmZmY2FhMDA" class="icoSlack" title="Slack" target="_blank"><i class="fa fa-slack"></i></a></li>
                            <li><a href="https://www.linkedin.com/company/dataturks/" class="icoLinkedin" title="Linkedin" target="_blank"><i class="fa fa-linkedin"></i></a></li>
                        </ul>
                    </div>
                  </div>
                </div>
            
            <div class="row">
                <div class="col-md-8 col-md-offset-2 text-center">
                <hr class="small">
                    <p class="text-muted">Copyright &copy; Trilldata Technologies Pvt Ltd 2018</p>
                </div>
            </div>
        </div>
    </footer>

<script>
var baseUrl = "";
  

function ToggleLicenseSection() {
  $('#license').toggle("slide", { direction: "right" }, 500);
}
$( "#setup" ).click(function(event) {
  event.preventDefault();
  ToggleLicenseSection();
   
});

$( "#licenseSubmit" ).click(function(event) {
  event.preventDefault();
  var licenseText = $('#licenseVal').val();
  
  if (licenseText.length < 10) {
          alert('Enter a valid License');
          return;
  }
    
  var request = $.ajax({
  url: baseUrl + "/dataturks/addLicense",
  type: "POST",
  dataType: 'json',
  contentType: "application/json; charset=utf-8", 
  headers: {"license" : licenseText},
  success: function (data){
    $("#licenseError").html( '<div class="text-success"> License updated Successfully !</div>');
    $('#licenseError').toggle("slide", { direction: "right" }, 500);
    ToggleLicenseSection();
  },
  error: function (data, exception){
    var msg = "";
    if (data.status === 0) {
          msg = 'Not able to connect to service.\n Verify Network.';
      } else if (data.status == 404) {
          msg = 'Requested page not found. [404]';
      } else if (data.status == 500) {
          msg = 'Internal Server Error [500].';
      } else if (exception === 'parsererror') {
          msg = 'Requested JSON parse failed.';
      } else if (exception === 'timeout') {
          msg = 'Time out error.';
      } else if (exception === 'abort') {
          msg = 'Request aborted.';
      } else {
        msg = ("responseJSON" in data.responseJSON) ? data.responseJSON.message : data.responseJSON;
        $("#licenseError").html( '<div class="text-danger"> Error: ' + msg + '</div>');
        $('#licenseError').toggle("slide", { direction: "right" }, 500);
      }
    alert(JSON.stringify(msg));
  }
  });
});



function ToggleChangePasswordSection() {
  $('#changePassword').toggle("slide", { direction: "right" }, 500);
}
$( "#changePasswordButton" ).click(function(event) {
  event.preventDefault();
  ToggleChangePasswordSection();
   
});

$( "#changePasswordSubmit" ).click(function(event) {
  event.preventDefault();
  var licenseText = $('#changePasswordLicenseVal').val();
  var email = $('#changePasswordEmail').val();
  var newPassword = $('#changePasswordPassword').val();
  
  if (licenseText.length < 10) {
          alert('Enter a valid License');
          return;
  }
  
  if (email.length < 3) {
          alert('Enter a valid email address');
          return;
  }
  
  if (newPassword.length < 6) {
          alert('Enter a valid password greater than 6 characters.');
          return;
  }
  
  var request = $.ajax({
  url: baseUrl + "/dataturks/updateAdminPassword",
  type: "POST",
  dataType: 'json',
  contentType: "application/json; charset=utf-8", 
  headers: {"license" : licenseText, "email" : email, "password" : newPassword},
  success: function (data){
    $("#changePasswordError").html( '<div class="text-success"> Password updated Successfully !</div>');
    $('#changePasswordError').toggle("slide", { direction: "right" }, 500);
    ToggleChangePasswordSection();
  },
  error: function (data, exception){
    var msg = "";
    if (data.status === 0) {
          msg = 'Not able to connect to service.\n Verify Network.';
      } else if (data.status == 404) {
          msg = 'Requested page not found. [404]';
      } else if (data.status == 500) {
          msg = 'Internal Server Error [500].';
      } else if (exception === 'parsererror') {
          msg = 'Requested JSON parse failed.';
      } else if (exception === 'timeout') {
          msg = 'Time out error.';
      } else if (exception === 'abort') {
          msg = 'Request aborted.';
      } else {
        msg = ("responseJSON" in data.responseJSON) ? data.responseJSON.message : data.responseJSON;
        $("#changePasswordError").html( '<div class="text-danger"> Error: ' + msg + '</div>');
        $('#changePasswordError').toggle("slide", { direction: "right" }, 500);
      }
    alert(JSON.stringify(msg));
  }
  });
});


</script>

    
    
    
</body>

</html>