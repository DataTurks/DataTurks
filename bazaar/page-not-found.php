<?php
require_once(__DIR__.'/backend/UIView.php');
echo getPageHead("Page not found", "Page not found", "", "");
?>

<body id="top" data-spy="scroll" data-target=".ngoNavBar" data-offset="50" class="textRecoBlog">

       
    
    <!--+++++++++++++++++++++Page contents starts ++++++++++++++++++++++++++++++++++++++++++-->

    <?php echo getBlogNavigation(); ?>
    
    <section class="marginTopExtra">
      <div class="container">
        <div class="row text-center">
          <div class="col-md-8 col-md-offset-2">
            <h1>Oops! Sometimes, somethings are never found !</h1>
            <h5>Page not found.</h5>
          </div>
        </div>
        
        <div class="row text-center">
          <div class="col-md-8 col-md-offset-2">
            <img class="marginTop" style="max-width:100%" src="https://storage.googleapis.com/bonsai-b808c.appspot.com/dataturks/website/nemo_min.png" />
            
          </div>
        </div>
        
        <div class="row text-center marginTop">
          <div class="col-md-8 col-md-offset-2">
            <h3>What say? Let's head back <a href="/" >home</a> now?</h3>
          </div>
        </div>
        
      </div>
    </section>
    
    <div class="marginTopExtra"></div>
    <div class="marginTopExtra"></div>
    <?php echo getFooter(); ?>
    
    <?php echo getPageFooterScripts(); ?>
    

</body>
</html>
