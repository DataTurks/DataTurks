<?php
require_once(__DIR__.'/backend/UIView.php');
echo getPageHead("Dataturks – Privacy Policy",
                 "Best online platform for your data annotation needs.",
                 "https://storage.googleapis.com/bonsai-b808c.appspot.com/dataturks/website/machine-learning-api.jpeg",
                 "Just upload your data, invite your team members and start tagging. The best way to tag training/evaluation data for your machine learning projects.");



?>


<body id="top" data-spy="scroll" data-target=".ngoNavBar" data-offset="50" >

       
    
    <!--+++++++++++++++++++++Page contents starts ++++++++++++++++++++++++++++++++++++++++++-->

    <?php echo getNavBar(); ?>
    
    <section class="marginTopExtra">
      <div class="container">
        <div class="row">
          
          <div class="col-md-10 col-md-offset-1 text-center">
            <h3>Data Policy</h3>
            <p class="lead marginTop text-left">
              For paid plans (even during trials) all data is completely private. Dataturks claims no ownership of any of your data.
            </p>
            <p class="lead margin text-left">
              For all public data plans please see our <a href="/open-data-policy.php"><i>Open Data Policy.</i></a>
            </p>
          </div>
        </div>
        <div class="row text-center">
          <div class="col-md-10 col-md-offset-1">
          
            <div class="marginTopExtra"></div>
            <?php
              $privacy = file_get_contents('./privacypolicy.htm');
              echo $privacy;
            ?>
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