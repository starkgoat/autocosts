<div id="main_div">
    
    <div id="banner_top">
        <div id="left_top_div">&nbsp;</div>
        <!--#####################-->
        <div id="header_main_title">
            <div id="main_title">
                <header>
                    <?php echo $GLOBALS["WORDS"]["main_title"] ?>
                </header>
            </div>
        </div>
        <!--## Select country box ##-->
        <div id="country_box">
            <div id="country_box_inline">
                <div id="banner_flag_div">
                    <div id="banner_flag"></div>
                </div>
                <div id="country_select_div">
                    <select name="country_select" id="country_select" onchange="onCountrySelect(this.value);">
                    </select>
                </div>
            </div>
        </div>
    </div> 
    
    <div id="container">
        <div id="description">
            <?php echo $GLOBALS["WORDS"]["initial_text"] ?>
        </div>
        
        <div id="container_table">
            
            <!-- div3 = LEFT layout column-->
            <div id="div3_td">
                <div id="div3">
                    <div id="div3a" class="roundCornerSlight">

                        <div class="roundCorner">
                            <img alt="Picture" src="images/logos/autocosts_dollar.png">
                        </div>

                        <br>

                        <a class="display_block" target="_blank" href="https://play.google.com/store/apps/details?id=info.autocosts">
                            <div id="div31" class="roundCorner">
                                <img alt="Android logo" src="images/android/playstore.svg">                                
                            </div>
                        </a>

                        <div id="div32" class="roundCorner">
                            <!-- Contact block -->
                            <div id="contact_div">
                                <!--hides email from bot spamers-->
                                <span class="codedirection">.stso<!-- >@. -->cotua<!-- >@. -->@<!-- >@. -->ofni</span>info
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            
            
            <!-- div2 = CENTRE layout column-->
            <div id="div2_td">
                <!--#####################################  CALCULATOR #####################################-->
                <div id="div2">
                    <form class="roundCorner" id="main_form" enctype="application/x-www-form-urlencoded"
                          action="javascript:void(0);" name="costs_form">
                        <div id="input_div">
                            <?php include $GLOBALS['HOME_DIR']."/layout/form.html" ?>
                        </div>
                    </form>
                </div>

                <!-- ************* PRINTING divs ***********************
                ******************************************************-->

                <!-- ************* Main Table  Section ****************** -->
                <div class="result_section" id="main_table_section">
                    <div class="result_div" id="main_table"></div>
                </div>
                <!-- ************* Monthly Costs section **************** -->
                <div class="result_section" id="monthly_costs_section">
                    <div class="hr">
                        <hr><hr>
                    </div>
                    <div class="result_section_title" id="monthly_costs_title">
                        <b><span class="lang-average_costs_per_type"></span></b>
                    </div>
                    <br>
                    <!-- first top (pie) chart -->
                    <div id="pie_chart_div" class="chart_div"></div><br>
                    <!-- second (bars) chart -->
                    <div id="bar_chart_div" class="chart_div"></div>
                    <!-- results tables -->
                    <div class="result_div" id="monthly_costs"></div>
                </div>
                <!-- ************* Financial Effort section************** -->
                <div class="result_section" id="fin_effort_section">
                    <div class="hr">
                        <hr><hr>
                    </div>
                    <div class="result_section_title" id="fin_effort_title">
                        <b><span class="lang-financial_effort"></span></b>
                    </div>
                    <!-- third chart -->
                    <div id="fin_effort_chart_div" class="chart_div"></div>
                    <!-- results table -->
                    <div class="result_div" id="fin_effort"></div>
                </div>
                <!-- ********* Alternative Costs to Car Costs section **************** -->
                <div class="result_section" id="alternative_to_carcosts_section">
                    <div class="hr">
                        <hr><hr>
                    </div>
                    <div class="result_section_title" id="alternative_to_carcosts_title">
                        <b><span class="lang-publ_tra_equiv"></span></b>
                    </div>
                    <!-- fourth chart -->
                    <div id="alternative_carcosts_chart_div" class="chart_div"></div>
                    <!-- results table -->
                    <div class="result_div" id="alternative_to_carcosts"></div>
                </div>
                <!-- ************* Buttons ****************** -->
                <div class="result_section" id="exten_costs_section">
                    <div class="result_div" id="extern_costs"></div>
                </div>
                <!-- ************* Buttons ****************** -->
                <div class="result_section" id="buttons_section">
                    <div class="hr">
                        <hr><hr>
                    </div>
                    <div class="result_div" id="result_buttons_div">
                        <button  id="rerun_button" class="button">
                            <span class="lang-button_rerun"></span>
                        </button>&nbsp;
                        <button  id="print_button" class="button">
                            <span class="lang-word_print"></span>
                        </button>&nbsp;
                        <button  id="generate_PDF" class="button">
                            <span class="lang-word_download_pdf"></span>
                        </button>
                        <div id="shareIcons"></div>
                    </div>
                </div>
                <!-- ************* ********* ************* -->
                <br>
            </div>
            
            
            <!-- div1 = RIGHT layout column-->
            <div id="div1_td">
                <div id="div1" class="roundCornerSlight">
                    <div id="div13">
                        <?php include $GLOBALS['HOME_DIR']."/tables/".$GLOBALS['country'].".html" ?>
                    </div>
                    <div id="br3">
                        <br>
                    </div>
                </div>
             </div>
        </div>
    </div>
    <br>
</div>