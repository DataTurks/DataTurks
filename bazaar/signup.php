<?php
require_once(__DIR__.'/backend/UIView.php');
echo getPageHead("Dataturks – Early access",
                 "Fun with APIs: Discover the best APIs for your need",
                 "https://storage.googleapis.com/bonsai-b808c.appspot.com/dataturks/website/machine-learning-api.jpeg",
                 "Test, compare and use all the world's best APIs from one place. Try computer vision APIs by Microsoft, Amazon, Kairos and others.");
?>


<body id="top" data-spy="scroll" data-target=".ngoNavBar" data-offset="50" >

       
    
    <!--+++++++++++++++++++++Page contents starts ++++++++++++++++++++++++++++++++++++++++++-->

    <?php echo getNavBar(); ?>
    
    <section class="marginTopExtra">
      <div class="container ">
        <div class="row text-center">
          <div class="col-md-8 col-md-offset-2">
            <h1>Early access</h1>
            <div class="marginTop">
              <h5>We are in beta and would love to have you onboard.</h5>
            </div>
            
          </div>
        </div>
        
        <div class="row text-center marginTopExtraExtra" id="emailSignupRow">
          <div class="col-md-8 col-md-offset-2">
            <form id="step1Form" class="emailSignup" >
              <div class="input-group">
                <input type="email" class="form-control" id="email" placeholder="Enter your email">
                  <span class="input-group-btn">
                    <button class="btn btn-theme" type="submit" id="getInvited">Get invited</button>
                  </span>
                </input>
              </div>
            </form>
          </div>
        
        </div>
      
      <div class="row text-center marginTopExtraExtra hidden" id="emailSignupThankyouRow">
          <div class="col-md-6 col-md-offset-3 text-center">
            <p class="lead"> <strong>Thank you ! We will contact you at the provided email.</strong></p>
          </div>
        </div>
      
      <div class="row marginTopExtraExtra">
          <div class="col-md-6 col-md-offset-3 text-center marginTop">
            <p> For any query or help please contact us at <strong>contact@dataturks.com</strong></p>
          </div>
        </div>
        
      </div>
        
      </div>
    </section>
    
    
     <div class="marginTopExtra"></div>
    <div class="marginTopExtra"></div>
    <?php echo getFooter(); ?>
    
    <?php echo getPageFooterScripts(); ?>
    
    <script>
      $("#getInvited").click(function() {
        var email = $("#email").val();
        ga('send','event','earlyAcess', 'enterEmail', "SomeEmail");
        if (!isEmail(email)) {
            alert("Please enter a valid email address !");
            return;
        }
        ga('send','event','earlyAcess', 'enterEmail', "ValidEmail");
        submitKeyValue(email, "", "DTEarlyAccess", "");
        $("#emailSignupRow").addClass("hidden");
        $("#emailSignupThankyouRow").removeClass("hidden");
        return false;
      });
    </script>

</body>

</html>