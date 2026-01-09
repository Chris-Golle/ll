<?php

function twentytwentyfive_child_enqueue_styles() {
    wp_enqueue_style(
        'twentytwentyfive-child',
        get_stylesheet_directory_uri() . '/style.css',
        array(),
        filemtime( get_stylesheet_directory() . '/style.css' )
    );
}
add_action( 'wp_enqueue_scripts', 'twentytwentyfive_child_enqueue_styles' );

/* enqueue child theme last to avoid the need for !important overrides */



// add_theme_support( 'post-thumbnails' );
    
    $version = wp_get_theme()->get('Version');
// Region switcher CSS
    wp_enqueue_style(
        'region-switcher',
        get_stylesheet_directory_uri() . '/css/region.css',
        array(),
        $version
    );
// sale
add_filter('woocommerce_sale_flash', 'ds_change_sale_text');
function ds_change_sale_text() {
return '<span class="onsale">Kickstarter<br/>price </span>';
}

// backorder
add_filter( 'woocommerce_get_availability_text', 'filter_product_availability_text', 10, 2 );
function filter_product_availability_text( $availability_text, $product ) {
    // Check if product status is on backorder
    // if ($product->get_stock_status() === 'onbackorder') {
        $availability_text = __( 'Produced on demand, please be patient', 'woocommerce' );
    // }
    return $availability_text;
}

/**
 * Personality Quiz Functions
 * Enhanced quiz system with better data handling and validation
 */

function enqueue_personality_quiz($atts) {
    // Prevent duplicate loading
    static $quiz_loaded = false;
    if ($quiz_loaded) {
        return;
    }
    $quiz_loaded = true;
    
    // Enqueue the enhanced quiz script
    wp_enqueue_script(
        'personality-quiz', 
        get_stylesheet_directory_uri() . '/personality-quiz.js', 
        array(), 
        '1.2.0', 
        true
    );
    
    // Enqueue the modern quiz CSS
    wp_enqueue_style(
        'modern-quiz-styles',
        get_stylesheet_directory_uri() . '/css/quiz-modern.css',
        array(),
        '1.0.0'
    );
    
    // Process and validate quiz data
    $questions = isset($atts['questions']) ? $atts['questions'] : '';
    $answers = isset($atts['answers']) ? $atts['answers'] : '';
    
    // Parse questions and answers with better error handling
    $processed_questions = array();
    $processed_answers = array();
    
    if (!empty($questions)) {
        $questions_array = explode("|||", $questions);
        foreach ($questions_array as $question) {
            $processed_questions[] = sanitize_text_field(trim($question));
        }
    }
    
    if (!empty($answers)) {
        $answers_array = explode("|||", $answers);
        foreach ($answers_array as $answer_group) {
            $answer_options = explode("|", $answer_group);
            $processed_answer_group = array();
            foreach ($answer_options as $answer) {
                $processed_answer_group[] = sanitize_text_field(trim($answer));
            }
            $processed_answers[] = $processed_answer_group;
        }
    }
    
    // Localize script with processed data
    wp_localize_script('personality-quiz', 'quiz_data', array(
        'questions' => $processed_questions,
        'answers' => $processed_answers,
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('personality_quiz_nonce'),
        'strings' => array(
            'quiz_started' => __('Personality quiz started. Question 1 of', 'lullberry'),
            'quiz_completed' => __('Quiz completed! Redirecting to results.', 'lullberry'),
            'question' => __('Question', 'lullberry'),
            'of' => __('of', 'lullberry'),
            'error_loading' => __('Error loading quiz. Please try again.', 'lullberry')
        )
    ));
    
    // Modern quiz styles are now loaded via external CSS file
}

/**
 * Get quiz-specific CSS styles
 */
function get_quiz_stylesx() {
    return '
        /* Quiz Modal Styles - Full Screen */
        #quiz-modal {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.9) !important;
            z-index: 9999 !important;
            display: none;
            overflow: hidden !important;
        }
        
        #quiz {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(255, 255, 255, 0.98) !important;
            padding: 0 !important;
            border-radius: 0 !important;
            max-width: none !important;
            text-align: center !important;
            box-shadow: none !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            min-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
        }
        
        .quiz-question {
            font-size: 2.5rem !important;
            margin-bottom: 50px !important;
            color: #333 !important;
            line-height: 1.4 !important;
            max-width: 800px !important;
            padding: 0 40px !important;
            text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8) !important;
        }
        
        .quiz-answer {
            display: block !important;
            width: 100% !important;
            max-width: 400px !important;
            margin: 20px auto !important;
            padding: 20px 30px !important;
            font-size: 1.3rem !important;
            border: none !important;
            border-radius: 12px !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            background: rgba(255, 255, 255, 0.9) !important;
            backdrop-filter: blur(10px) !important;
        }
        
        .quiz-answer:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(96, 125, 139, 0.4);
        }
        
        .quiz-answer:focus {
            outline: 3px solid #607d8b;
            outline-offset: 2px;
        }
        
        .quiz-progress {
            position: fixed;
            top: 0;
            left: 0;
            height: 8px;
            background: linear-gradient(90deg, #607d8b, #AAC9C3);
            transition: width 0.4s ease;
            border-radius: 0;
            z-index: 10001;
        }
        
        #close-quiz {
            position: fixed;
            top: 30px;
            right: 30px;
            background: rgba(255, 255, 255, 0.95);
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            cursor: pointer;
            display: none;
            z-index: 10002;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }
        
        #close-quiz:hover {
            background: rgba(255, 255, 255, 1);
            transform: scale(1.1);
        }
        
        /* Full Screen Quiz Enhancements */
        .quiz-answer:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 30px rgba(96, 125, 139, 0.4);
            background: rgba(255, 255, 255, 1);
        }
        
        .quiz-answer:focus {
            outline: 3px solid #607d8b;
            outline-offset: 3px;
            transform: translateY(-2px);
        }
        
        /* Quiz Container Enhancements */
        #quiz {
            position: relative !important;
        }
        
        /* Force Full Screen Override */
        body.quiz-active {
            overflow: hidden !important;
        }
        
        #quiz-modal.show {
            display: block !important;
        }
        
        /* Ensure no other styles interfere */
        #quiz-modal * {
            box-sizing: border-box !important;
        }
        
        /* Additional Full Screen Enforcement */
        #quiz-modal.show {
            display: block !important;
            width: 100vw !important;
            height: 100vh !important;
        }
        
        #quiz-modal.show #quiz {
            width: 100% !important;
            height: 100% !important;
            min-height: 100vh !important;
        }
        
        /* Override any potential conflicting styles */
        .quiz-question,
        .quiz-answer {
            font-size: inherit !important;
            margin: inherit !important;
            padding: inherit !important;
        }
        
        /* Force full viewport */
        html.quiz-active,
        body.quiz-active {
            overflow: hidden !important;
            position: fixed !important;
            width: 100% !important;
            height: 100% !important;
        }
        

        
        /* Background Image Enhancement */
        #quiz::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: inherit;
            background-size: cover;
            background-position: center;
            filter: brightness(0.9) contrast(1.1);
            z-index: -1;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .quiz-question {
                font-size: 2rem;
                margin-bottom: 40px;
                padding: 0 30px;
            }
            
            .quiz-answer {
                padding: 18px 25px;
                font-size: 1.2rem;
                max-width: 350px;
            }
            
            #close-quiz {
                top: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                font-size: 20px;
            }
        }
        
        @media (max-width: 480px) {
            .quiz-question {
                font-size: 1.8rem;
                margin-bottom: 35px;
                padding: 0 25px;
            }
            
            .quiz-answer {
                padding: 15px 20px;
                font-size: 1.1rem;
                max-width: 300px;
            }
            
            #close-quiz {
                top: 15px;
                right: 15px;
                width: 45px;
                height: 45px;
                font-size: 18px;
            }
        }
    ';
}



// add my shortcodes
include('chris-shortcodes.php');

// Enqueue my jQuery scripts 
add_action('wp_enqueue_scripts', 'add_my_scripts');
function add_my_scripts()
{
    wp_enqueue_script(
        'chris-js-script', // 	name your script so that you can attach other scripts and de-register, etc.
        get_stylesheet_directory_uri() . '/chris-js-scripts.js', // 	this is the location of your script file
        array('jquery') // 	this array lists the scripts upon which your script depends
    );
}

/*** @snippet       Disable WooCommerce Ajax Cart Fragments Everywhere */
// add_action('wp_enqueue_scripts', 'bbloomer_disable_woocommerce_cart_fragments', 11);
function bbloomer_disable_woocommerce_cart_fragments()
{
    wp_dequeue_script('wc-cart-fragments');
}

/** Disable Ajax Call from WooCommerce, */
// Christophe : if i enable fragments to show live items added to cart, check CPU at https://my.siteground.com/services/hosting/TGcveFpYZ0tJdz09/statistics 
// add_action( 'wp_enqueue_scripts', 'dequeue_woocommerce_cart_fragments', 11);
// function dequeue_woocommerce_cart_fragments() {
// 	if (is_front_page()) wp_dequeue_script('wc-cart-fragments');}

/**
 * Allow changing or removing the Rank Math Breadcrumb items (we remove category names)
 *
 * @param array       $crumbs The crumbs array.
 * @param Breadcrumbs $this   Current breadcrumb object.
 */
// add_filter('rank_math/frontend/breadcrumb/items', function ($crumbs, $class) {
//     if (is_product() || is_product_category()) {
//         unset($crumbs[1]);
//         $crumbs = array_values($crumbs);
//         return $crumbs;
//     }
//     return $crumbs;
// }, 10, 2);

/**
 * Product Page: Remove product data tabs
 */
// add_filter( 'woocommerce_product_tabs', 'woo_remove_product_tabs', 98 );
// function woo_remove_product_tabs($tabs)
// {
//     // unset( $tabs['description'] );      	// Remove the description tab
//     // unset( $tabs['reviews'] ); 			// Remove the reviews tab
//     unset($tabs['additional_information']);      // Remove the additional information tab
//     return $tabs;
// }

// remove empty second tab of size guide of bags, via removing the whole tabs
// add_action('init', 'bbloomer_apply_css_if_url_contains_string');
// function bbloomer_apply_css_if_url_contains_string()
// {
//     $url = $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
//     if (false !== strpos($url, 'an-eco-bag-for')) {
//         echo '<style type="text/css">
//          .pf-product-size-guide__tabs { display:none; }
//          </style>';
//     }
// }

// edit cart to replace WPML translation products with English products that can sync to printful, and give a Printful shipping rate. 
// Using https://wpml.org/wpml-hook/wpml_object_id
// It seems that variation_id is a solid identifier and does not change with wpml lang change, but Woocommerce gives product_id according to the current lang. The need to specify product_id for variable products below is in question. 

// define the woocommerce_checkout_create_order callback - https://rudrastyh.com/woocommerce/order-items.html
function action_woocommerce_checkout_create_order($order, $data)
{
    if (is_admin()) {
        return;
    }
    write_to_screen($order);
    write_to_screen($data);
    $prevent_loop = 0;
    $order_id = $order->get_order_number();
    $order_items = $order->get_items;
    foreach ($order_items as $order_item_key => $order_item) {
        $product_id = $order_item->get_product_id();
        $product = $order_item->get_product();
        // simple products
        if ($product->is_type('simple')) {
            $product_id_EN = apply_filters('wpml_object_id', $product_id, 'product', true, 'en');
            write_to_console(' loop#' . $prevent_loop);
            write_to_console(' product init ' . $product_id . ' no variation');
            write_to_console(' product EN ' . $product_id_EN . ' no variation');
            $quantity = $order_item->get_quantity();
            wc_delete_order_item($order_item_key);
            wc_add_order_item($product_id_EN, $quantity);
        }
        // variable products
        elseif ($product->is_type('variable')) {
            // write_to_screen($product);
            // write_to_screen($product->get_type());
            $variation_id = $order_item->get_variation_id();
            $product_id_EN = apply_filters('wpml_object_id', $product_id, 'product', true, 'en');
            $variation_id_EN = apply_filters('wpml_object_id', $variation_id, 'product', true, 'en');
            // $variation_id_EN = apply_filters( 'translate_object_id', $variation_id, 'product_variation', false, 'en' );
            write_to_console(' loop#' . $prevent_loop);
            write_to_console(' product init ' . $product_id . ' variation init ' . $variation_id);
            write_to_console(' product EN ' . $product_id_EN . ' variation EN ' . $variation_id_EN);
            $quantity = $order_item->get_quantity();
            // $variation_data = wc_get_product_variation_attributes( $variation_id );
            // write_to_console($variation_data);

            // wc_delete_order_item($order_item_key);

            $order_item_id = wc_add_order_item($order_id, array(
                'order_item_name' => 'Some product',
                'order_item_type' => 'line_item', // product
            ));
            wc_add_order_item_meta($order_item_id, '_qty', $quantity, true); // quantity
            wc_add_order_item_meta($order_item_id, '_variation_id', $variation_id_EN, true); // ID of the variation

            // wc_add_order_item( $product_id_EN, $quantity, $variation_id_EN, ); //$variation_data );
            // WC()->cart->add_to_cart( 39643, 1, 45994, 'Heather Midnight Navy,S' );
        }
        $prevent_loop += 1;
        if ($prevent_loop > 99) {
            return;
        }
    }
};

// add the action 
// add_action( 'woocommerce_checkout_create_order','action_woocommerce_checkout_create_order', 10, 2 ); 


// add_action( 'woocommerce_before_cart', 'replace_products' );
function replace_products()
{
    if (is_admin()) {
        return;
    }
    // $cart = wc_get_order( $order_id );
    if (WC()->cart->is_empty()) {
        return;
    }
    $cart = WC()->cart->get_cart();
    // write_to_screen($cart);
    $prevent_loop = 0;
    foreach ($cart as $cart_item_key => $cart_item) {
        $product_id = $cart_item['product_id'];
        $product = wc_get_product($product_id);
        // simple products
        if ($product->is_type('simple')) {
            $product_id_EN = apply_filters('wpml_object_id', $product_id, 'product', true, 'en');
            write_to_console(' loop#' . $prevent_loop);
            write_to_console(' product init ' . $product_id . ' no variation');
            write_to_console(' product EN ' . $product_id_EN . ' no variation');
            $quantity = $cart_item['quantity'];
            WC()->cart->remove_cart_item($cart_item_key);
            WC()->cart->add_to_cart($product_id_EN, $quantity);
        }
        // variable products
        elseif ($product->is_type('variable')) {
            // write_to_screen($product);
            // write_to_screen($product->get_type());
            $variation_id = $cart_item['variation_id'];
            $product_id_EN = apply_filters('wpml_object_id', $product_id, 'product', true, 'en');
            $variation_id_EN = apply_filters('wpml_object_id', $variation_id, 'product', true, 'en');
            // $variation_id_EN = apply_filters( 'translate_object_id', $variation_id, 'product_variation', false, 'en' );
            write_to_console(' loop#' . $prevent_loop);
            write_to_console(' product init ' . $product_id . ' variation init ' . $variation_id);
            write_to_console(' product EN ' . $product_id_EN . ' variation EN ' . $variation_id_EN);
            $quantity = $cart_item['quantity'];
            $variation_data = wc_get_product_variation_attributes($variation_id);
            write_to_console($variation_data);
            WC()->cart->remove_cart_item($cart_item_key);
            WC()->cart->add_to_cart($product_id_EN, $quantity, $variation_id_EN,); //$variation_data );
            // WC()->cart->add_to_cart( 39643, 1, 45994, 'Heather Midnight Navy,S' );
        }
        $prevent_loop += 1;
        if ($prevent_loop > 99) {
            return;
        }
    }
}

// hide 'clear' in 'Choose options' reset_variations
add_filter('woocommerce_reset_variations_link', '__return_empty_string');

// CART
// change empty cart button to send to Look at you!
// add_filter('woocommerce_return_to_shop_redirect', 'change_return_shop_url');
function change_return_shop_url()
{
    // return home_url();
    return (home_url() . '/cat/look-at-you');
}

// Chris - Remove Sorting dropdown and number of results in Woocommerce
remove_action('woocommerce_before_shop_loop', 'woocommerce_result_count', 20);
remove_action('woocommerce_before_shop_loop', 'woocommerce_catalog_ordering', 30);

// COUPON CODES
// hide coupon field on cart page
function hide_coupon_field_on_cart( $enabled ) {
	if ( is_cart() ) {
		$enabled = false;
	}
	return $enabled;
}
// add_filter( 'woocommerce_coupons_enabled', 'hide_coupon_field_on_cart' );

// $coupontxt = __( "I have a coupon code", "coupon-codes" );
// rename "Have a Coupon?" message on checkout page
// function woocommerce_rename_coupon_message_on_cart() {
// 	global $coupontxt;
// 	echo '<a href="#" onclick="toggleCoupon()" class="showcoupon">' . $coupontxt . '</a>';
// }
// add_action('woocommerce_before_cart', 'woocommerce_rename_coupon_message_on_cart', 10, 2);

// rename "Have a Coupon?" message on checkout page
// function woocommerce_rename_coupon_message_on_checkout() {
// 	global $coupontxt;
// 	return '<a href class="showcoupon">' . $coupontxt . '</a>';
// }
// add_filter( 'woocommerce_checkout_coupon_message', 'woocommerce_rename_coupon_message_on_checkout' );

// hide the text that pops up
// function woocommerce_change_coupon_field_instruction_text($mytext) {
// 	$mytext = str_ireplace('If you have a coupon code, please apply it below.', 'As a regular customer you will sometimes find a coupon code in your order or in your inbox. If this is your lucky day, congratulations!', $mytext);
// 	return $mytext;
// }
// add_filter( 'gettext', 'woocommerce_change_coupon_field_instruction_text' );

// rename the coupon field on the checkout page - if turned on, this disables woo translations and wpml is not picking up the strings either 
// function woocommerce_rename_coupon_field_on_checkout( $translated_text, $text, $text_domain ) {
// 	// 	bail if not modifying frontend woocommerce text
// 				if ( is_admin() || 'woocommerce' !== $text_domain ) {
// 		return $translated_text;

// 	}
// 	if ( 'Coupon code' === $text ) {
// 		$translated_text = 'Code';
// 	}
// 	elseif ( 'Apply coupon' === $text ) {
// 		$translated_text = 'Apply';
// 	}
// 	return $translated_text;
// }
// add_filter( 'gettext', 'woocommerce_rename_coupon_field_on_checkout', 10, 3 );

/*
Allow HTML in term (category, tag) descriptions https://docs.woocommerce.com/document/allow-html-in-term-category-tag-descriptions/
 */
foreach (array('pre_term_description') as $filter) {
    remove_filter($filter, 'wp_filter_kses');
    if (!current_user_can('unfiltered_html')) {
        add_filter($filter, 'wp_filter_post_kses');
    }
}

foreach (array('term_description') as $filter) {
    remove_filter($filter, 'wp_kses_data');
}

/* Show tax suffix by visitorcountry */
/* Find country */
function get_user_geo_country()
{
    $geo = new WC_Geolocation();
    // 	Get WC_Geolocation instance object
    $user_ip  = $geo->get_ip_address();
    // 	Get user IP
    $user_geo = $geo->geolocate_ip($user_ip);
    // 	Get geolocated user data.
    $country  = $user_geo['country'];
    // 	Get the country code
    // 	return WC()->countries->countries[ $country ];
    // 	return the country name
    return $country;
    // 	return the country code
}

if (!function_exists('get_user_geo_region')) {
    function get_user_geo_region()
    {
        // if user user already picked a region (present in the URL parameter)
        if (isset($_GET['region'])) {
            switch ($_GET['region']) {
                case "usa":
                    $_SESSION['region'] = "USA";
                    break;
                case "europe":
                    $_SESSION['region'] = "Europe";
                    break;
                case "canada":
                    $_SESSION['region'] = "Canada";
                    break;
                case "oz-nz":
                    $_SESSION['region'] = "Australia";
                    break;
                // case "japan":
                //     $_SESSION['region'] = "Japan";
                //     break;
                case "other":
                    $_SESSION['region'] = "Other";
                    break;
                // below seems needed at the moment
                default:
                    $_SESSION['region'] = "Other";
            }
            return $_SESSION['region'];
        }
        // if no region has been picked and the session does not have this info either, we geolocate
        else if (!isset($_SESSION['region'])) {
            $geo      = new WC_Geolocation(); // Get WC_Geolocation instance object
            $user_ip  = $geo->get_ip_address(); // Get user IP
            $user_geo = $geo->geolocate_ip($user_ip); // Get geolocated user data.
            $country_code  = $user_geo['country']; // Get the country code
            // $country_name = WC()->countries->countries[ $country ]; // return the country name
            switch ($country_code) {
                case "US":
                    $_SESSION['region'] = "USA";
                    break;
                case "AD":
                case "AL":
                case "AT":
                case "BA":
                case "BE":
                case "BG":
                case "BY":
                case "CH":
                case "CY":
                case "CZ":
                case "DK":
                case 'EE':
                case "ES":
                case "FI":
                case "FO":
                case "FR":
                case "DE":
                case "GB":
                case "GG":
                case "GI":
                case "GR":
                case "HR":
                case "HU":
                case "IE":
                case "IS":
                case "IT":
                case "LI":
                case "LV":
                case "LT":
                case "LU":
                case "MC":
                case "MD":
                case "ME":
                case "MK":
                case "MT":
                case "NL":
                case "NO":
                case "PO":
                case "PT":
                case "RO":
                case "RS":
                case "SI":
                case "SJ":
                case "SK":
                case "SM":
                case "SE":
                case "UA":
                    $_SESSION['region'] = "Europe";
                    break;
                case "CA":
                    $_SESSION['region'] = "Canada";
                    break;
                case "AU":
                case "NZ":
                    $_SESSION['region'] = "Australia";
                    break;
                // case "JP":
                //     $_SESSION['region'] = "Japan";
                //     break;
                default:
                    $_SESSION['region'] = "Other";
            }
        }
        echo "<script>console.log('Debug Objects: session: " . session_id() . ' region ' . $_SESSION['region'] . '|' . "' );</script>";
        return $_SESSION['region'];
    }
}

// Prices including tax - Experimental Behavior (https://github.com/woocommerce/woocommerce/wiki/How-Taxes-Work-in-WooCommerce#prices-including-tax---experimental-behavior)
// add_filter( 'woocommerce_adjust_non_base_location_prices', '__return_false');

/* Add tax suffix */
add_filter('woocommerce_get_price_suffix', 'bbloomer_add_price_suffix', 99, 4);
function bbloomer_add_price_suffix($html, $product, $price, $qty)
{
    switch (get_user_geo_region()) {
        case "US":
            $html .= '<small class="woocommerce-price-suffix"> inc. tax</small>';
            break;
        case "AU":
        case "NZ":
            $html .= '<small class="woocommerce-price-suffix"> inc. GST</small>';
            break;
            // 		case "EE":
            // 		$html .= '<small class="woocommerce-price-suffix"> (inc. VAT)</small>';
            // 		break;
        default:
    }
    // 	$html .= get_user_geo_country();
    return $html;
}

// write to console
function write_to_console($data)
{
    $output = $data;
    if (is_array($output))
        $output = implode(',', $output);
    echo "<script>console.log('Lullberry: " . $output . "' );</script>";
}

function write_to_screen($data)
{
    echo '<pre>';
    print_r($data);
    echo '</pre>';
}

// function write_json_to_screen($data) {
// 	// echo '<pre>';
// 	// print_r(json_decode(json_encode($data, JSON_PRETTY_PRINT)));
// 	$obj=json_decode($data);
// 	$json=json_encode($obj, JSON_PRETTY_PRINT);
// 	printf("<pre>%s</pre>", $json);
// 	// echo '</pre>';
// }


// BACKEND
// START Stop removing span tags from WordPress - Linklay
function tinymce_fix($init)
{
    // html elements being stripped
    $init['extended_valid_elements'] = 'span[*]';

    // pass back to wordpress
    return $init;
}
add_filter('tiny_mce_before_init', 'tinymce_fix');
// END Stop removing span tags from WordPress
// Include board animation functionality
include(get_stylesheet_directory() . '/board-animation-functions.php');

