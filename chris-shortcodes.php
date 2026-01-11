<?php

add_shortcode('product_fullscreen', 'lullberry_product_fullscreen_shortcode');
function lullberry_product_fullscreen_shortcode($atts) {
    $atts = shortcode_atts(array(
        'product_id' => null,
    ), $atts, 'product_fullscreen');

    if (empty($atts['product_id'])) {
        return '<!-- Product ID missing -->';
    }

    $product = wc_get_product($atts['product_id']);
    if (!$product) {
        return '<!-- Product not found -->';
    }

    $permalink = get_permalink($atts['product_id']);

    return '<button class="product-fullscreen-button" data-product-url="' . esc_url($permalink) . '">View Fullscreen</button>';
}

/**
 * Personality Quiz Shortcode
 * Enhanced shortcode with better validation and error handling
 */
function personality_quiz_shortcode($atts) {
    $atts = shortcode_atts(array(
        'questions' => '',
        'answers' => '',
        'title' => __('Which of the 20 character strengths are yours?', 'lullberry'),
        'description' => __('Find out in 4 playful questions', 'lullberry'),
        'start_button_text' => __('Take the Quiz', 'lullberry'),
    ), $atts, 'personality_quiz');

    // Use default quiz data if no attributes provided
    if (empty($atts['questions']) || empty($atts['answers'])) {
        $atts['questions'] = "1. You go for a picnic. Is it: alone with the sound of birds, or with pets and friends?|||2. You start a summer job. Is it: counting the stars, or drawing new stars?|||3. You find a magic lamp. Does it: increase happiness, or decrease suffering?|||4. You move to a desert island. You befriend: a spirited lizard, or a sweet teddy bear?";
        $atts['answers'] = "Alone with birds|With pets and friends|||Counting the stars|Drawing new stars|||Increase happiness|Decrease suffering|||A spirited lizard|A sweet teddy bear";
    }

    // Enqueue quiz functionality only once
    enqueue_personality_quiz($atts);
    
    // Return quiz trigger button
    $output = '<div class="personality-quiz-trigger quiz-not-taken">';
    if (!empty($atts['title'])) {
        $output .= '<h3 class="quiz-title">' . esc_html($atts['title']) . '</h3>';
    }
    if (!empty($atts['description'])) {
        $output .= '<p class="quiz-description">' . wp_kses_post($atts['description']) . '</p>';
    }
    $output .= '<button class="start-quiz button no-shade wp-block-button__link" type="button">' . esc_html($atts['start_button_text']) . '</button>';
    $output .= '</div>';
    
    return $output;
}
add_shortcode('personality_quiz', 'personality_quiz_shortcode');

/**
 * Simple Quiz Shortcode
 * No attributes required - uses default quiz data
 * This shortcode now just calls the main personality quiz with default data
 */
function simple_quiz_shortcode($atts) {
    $atts = shortcode_atts(array(
        'title' => __('Which of the 20 character strengths are yours?', 'lullberry'),
        'description' => __('Find out in 4 playful questions<br>Take the quiz', 'lullberry'),
        'start_button_text' => __('Start Quiz', 'lullberry'),
    ), $atts, 'simple_quiz');
    
    // Use default quiz data
    $default_questions = "1. You go for a picnic. Is it: alone with the sound of birds, or with pets and friends?|||2. You start a summer job. Is it: counting the stars, or drawing new stars?|||3. You find a magic lamp. Does it: increase happiness, or decrease suffering?|||4. You move to a desert island. You befriend: a spirited lizard, or a sweet teddy bear?";
    $default_answers = "Alone with birds|With pets and friends|||Counting the stars|Drawing new stars|||Increase happiness|Decrease suffering|||A spirited lizard|A sweet teddy bear";
    
    // Call the main personality quiz shortcode with default data
    return personality_quiz_shortcode(array(
        'questions' => $default_questions,
        'answers' => $default_answers,
        'title' => $atts['title'],
        'description' => $atts['description'],
        'start_button_text' => $atts['start_button_text']
    ));
}
add_shortcode('simple_quiz', 'simple_quiz_shortcode');

// GPT quiz 2
function my_product_categories_shortcode($atts)
{
    $out = '';
    $atts = shortcode_atts(array(
        'age' => 0
    ), $atts);
    $age = intval($atts['age']);
    if (isset($_GET['quiz'])) {
        $categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
        ));
        // foreach ( $categories as $category ) {
        //     if ( $category->term_id == $quiz ) {
        //         $output .= '<a href="' . get_term_link( $category ) . '">' . $category->name . '</a><br>';
        //     }
        // }

        // Chris- start of widget code
        global $wp;

        if ($age == 0) { // adult quiz
            $strengths = array("356" => "3121", "261" => "2122", "98" => "3121", "264" => "3233", "26" => "3231", "113" => "1121", "100" => "2322", "101" => "3313", "102" => "2321", "103" => "3233", "104" => "1122", "105" => "2231", "390" => "3213", "107" => "2332", "108" => "2111", "88" => "3332", "110" => "1131", "115" => "1332", "116" => "2312", "106" => "1131",);
        } else if ($age == 1) { // children quiz
            $strengths = array("798" => "1323", "796" => "1331", "795" => "2333", "797" => "3123", "799" => "3312", "802" => "3213", "800" => "3232", "801" => "3311",);
        }

        $product_cats_ids_list = '';
        $product_cats_ids_array = array();
        $quiz_results = $_GET['quiz'];

        foreach ($strengths as $id => $value) {
            // the result matches if each answer is a match (1 or2), or if the strength has a 3 at that place (it's a non-match if their multiplication equals 2)
            $isMatching = true;
            for ($i = 0; $i < 4; $i++) {
                $isMatching *= (int) (substr($value, $i, 1) * (int) substr($quiz_results, $i, 1) != 2);
            }
            if ($isMatching) {
                $product_cats_ids_list .= $id . ', ';
                array_push($product_cats_ids_array, $id);
            }
        }

        $nb_strengths = count($product_cats_ids_array);

        if ($nb_strengths > 0) {
            // display with pleasant nb of columns
            if ($age == 0) { // adult quiz
                $nb_cols = min(3, $nb_strengths);
                $out .= '<div class="showing_main_cats">' . do_shortcode('[product_categories ids="' . $product_cats_ids_list . '" hide_empty="0" columns="' . $nb_cols . '"]') . '</div>';
                // run the typwriter effect with the chosen categories
                $correspondanceTable = array(
                    "356" => "calm",
                    "261" => "compassionate",
                    "98" => "courageous",
                    "264" => "creative",
                    "26" => "curious",
                    "113" => "disciplined",
                    "100" => "forgiving",
                    "101" => "grateful",
                    "102" => "honest",
                    "103" => "hopeful",
                    "104" => "humble",
                    "105" => "a little clown",
                    "390" => "joyful",
                    "107" => "kind",
                    "108" => "able to lead",
                    "88" => "loving",
                    "110" => "eager to learn",
                    "115" => "on a spiritual path",
                    "116" => "part of a team",
                    "106" => "a seeker of wisdom",
                );
                $adjectives = array_map(function ($ids) use ($correspondanceTable) {
                    return $correspondanceTable[$ids];
                }, $product_cats_ids_array);
                // write_to_console(implode($adjectives));
                $out .= '<script>wordflick(["' . implode('","', $adjectives) . '"])</script>';
                // END typewriter
            } else if ($age == 1) { // child quiz, we don't show the calligraphies
                // $nb_cols = min(5,$nb_strengths);
                $nb_cols = 3;
                for ($j = 0; $j < $nb_strengths; $j++) {
                    $strength_id = $product_cats_ids_array[$j];
                    // remove_action( 'woocommerce_before_subcategory_title', 'woocommerce_subcategory_thumbnail', 10 );
                    $out .= '<div class="showing_main_cats_kids">' . do_shortcode('[product_categories ids="' . $strength_id . '" hide_empty="0"]') . '</div>';
                    $out .= '<div class="showing_subcats_kids">' . do_shortcode('[product_categories parent="' . $strength_id . '" hide_empty="0" columns="' . $nb_cols . '"]') . '</div>';
                }

                $correspondanceTable = array(
                    "795" => "kind",
                    "798" => "calm",
                    "796" => "grown up",
                    "802" => "grateful",
                    "799" => "happy",
                    "797" => "brave",
                    "801" => "eager to learn",
                    "800" => "loving"
                );
                $adjectives = array_map(function ($ids) use ($correspondanceTable) {
                    return $correspondanceTable[$ids];
                }, $product_cats_ids_array);
                // write_to_console(implode($adjectives));
                $out .= '<script>wordflick(["' . implode('","', $adjectives) . '"])</script>';
                // END typewriter

            }
        } else {
            $out = '<img src="https://www.lullberry.com/wp-content/uploads/box.png" style="margin: auto; display: block;}"></img>';
        }
        wp_reset_postdata();
        // Chris- end of widget code
    } else {
        if (isset($_GET['all'])) {
            if ($age == 0) { // adult quiz
                $nb_cols = 3;
                $out = '<div class="showing_main_cats">' . do_shortcode('[product_categories parent="39" hide_empty="0" columns="' . $nb_cols . '"]') . '</div>';
            } else if ($age == 1) { // child quiz, we don't show the calligraphies
                $nb_cols = 3;
                $out = '<div class="showing_main_cats_kids">' . do_shortcode('[product_categories parent="792" hide_empty="0" columns="' . $nb_cols . '"]') . '</div>';
        }}
    };
    return $out;
}
add_shortcode('product_categories_quiz', 'my_product_categories_shortcode');
// END GPT

add_shortcode('chris_region', 'chris_region_function');
function chris_region_function()
{
    // a session enables us to store the user region
    if (!session_id()) {
        session_start();
    }

    // avoid repeat for DKK and CHF: the symbol returned is DKK for DKK but &#67;&#72;&#70; for CHF, need to convert
    $currency_code = get_woocommerce_currency();
    $currency_symbol = html_entity_decode(get_woocommerce_currency_symbol());
    $lang = ICL_LANGUAGE_CODE;

    if ($currency_code == $currency_symbol) {
        $currency_symbol = '';
    } else {
        $currency_symbol = ' ' . $currency_symbol;
    }
    $region = get_user_geo_region();
    // globe icon followed by current regions settings, and embedded region in attribute for use by chris-scripts.js to hghlight current region (%s ICL_LANGUAGE_NAME can be added if needed)
    $output = '<div id="regions" ><a onclick="chrisToggleRegion()" style="cursor: pointer;" id="region" region="' . $region . '">' . $region . '&nbsp;&nbsp;' . $currency_code . '&nbsp;' . $currency_symbol . '</a></div>';
    // $output = '<div><i class="fas fa-globe-americas" style="font-size:20px" id="region" region="' . get_user_geo_region() . '"></i>&nbsp;&nbsp; %s &nbsp; %s', $_SESSION['region'], $currency_code . $currency_symbol . '</div>';
    // echo "<script>console.log('Debug Objects: session: " . session_id() . ' lang: ' . $lang . ' region ' . $_SESSION['region'] . '|' .  $currency_code . '|' . $currency_symbol . "' );</script>";
    return $output;
}

add_shortcode('cat_thumbnail', 'my_cat_thumbnail_shortcode');
function my_cat_thumbnail_shortcode($atts)
{
    $a = shortcode_atts(array(
        'id' => 0,
    ), $atts);
    $result = null;
    if (is_product_category()) {
        global $wp_query;
        $cat = $wp_query->get_queried_object();
        $thumbnail_id = get_term_meta($cat->term_id, 'thumbnail_id', true);
        $image = wp_get_attachment_url($thumbnail_id);
        if ($image) {
            $result = '<img class="cat_thumbnail" src="' . $image . '" alt="' . $cat->name . '" />';
        }
    }
    return ($result);
}

add_shortcode('cat_description', 'my_cat_description_shortcode');
function my_cat_description_shortcode($atts)
{
    $a = shortcode_atts(array(
        'id' => 0,
    ), $atts);
    $result = category_description($a['id']);
    // write_to_console($result);
    // remove_filter($result, 'wp_kses_data' );
    // write_to_console($result);
    return ($result);
}

// write to console
if (!function_exists('write_to_console')) {
    function write_to_console($output)
{
    if (is_array($output))
        $output = implode(',', $output);
    echo "<script>console.log('Lullberry: " . $output . "' );</script>";
}}
