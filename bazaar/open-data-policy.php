<?php
require_once(__DIR__.'/backend/UIView.php');
echo getPageHead("Dataturks – Open Data Policy.",
                 "Best online platform for your ML data annotation needs.",
                 "https://storage.googleapis.com/bonsai-b808c.appspot.com/dataturks/website/machine-learning-api.jpeg",
                 "Just upload your data, invite your team members and start tagging. The best way to tag training/evaluation data for your machine learning projects.");


?>


<body id="top" data-spy="scroll" data-target=".ngoNavBar" data-offset="50" >

       
    
    <!--+++++++++++++++++++++Page contents starts ++++++++++++++++++++++++++++++++++++++++++-->

    <?php echo getNavBar(); ?>
    
    <section class="marginTopExtra">
      <div class="container">
        <div class="row text-center">
          <div class="col-md-10 col-md-offset-1">
            <h1> Open Data Policy.</h1>
            <div class="marginTopExtra"></div>
            
            <p class="lead text-left">If you are in an Open Data Plan than this policy applies to all you projects and datasets you upload/create on Dataturks.</p>
            
            <p> All such Open Datasets are placed under <a href="https://www.apache.org/licenses/LICENSE-2.0" class="color-teal">Apache License 2.0</a></p>
            <img src="https://storage.googleapis.com/bonsai-b808c.appspot.com/dataturks/website/apache_lic.png" style="width:60%; height:auto" />
            <div class="marginTopExtra"></div>
            <p class="text-left"> <strong>Belief:</strong> By using Dataturks services to build Open Datasets for your personal needs, you are contributing to
            ML community at large by making the dataset open. </p>
            
            <div class="marginTop"></div>
            <p class="text-left"> Also, for a fair application of the above belief, since these Datasets are open, once created you cannot delete the project or the data items in the project. </p>
            
            <div class="marginTopExtra"></div>
            <p class="text-left"> <strong>Personally Identifiable Information (PPI):</strong> In your public datasets, we strictly prohibit uploading
            of non-public PPI data like ID cards, Bank Statements etc or of uploading copyrighted data. If such datasets are flagged or automatically detected,
            we will proactively delete all such projects and you might lose access to your account.</p>
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