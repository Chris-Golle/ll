<?php
/**
 * Board Animation Custom Post Type and Functions
 * 
 * @package Board_Animation
 * @version 1.0.0
 * 
 * This file handles:
 * - Custom post type registration for board animations
 * - Meta boxes for board messages and completion messages
 * - Asset enqueuing (CSS/JS)
 * - Data processing and validation
 * - WordPress integration and security
 */

// Register custom post type for board animations
add_action('init', 'register_board_animation_post_type');
function register_board_animation_post_type() {
    $labels = array(
        'name'               => 'Board Animations',
        'singular_name'      => 'Board Animation',
        'menu_name'          => 'Board Animations',
        'add_new'            => 'Add New',
        'add_new_item'       => 'Add New Board Animation',
        'edit_item'          => 'Edit Board Animation',
        'new_item'           => 'New Board Animation',
        'view_item'          => 'View Board Animation',
        'search_items'       => 'Search Board Animations',
        'not_found'          => 'No board animations found',
        'not_found_in_trash' => 'No board animations found in trash'
    );
    
    $args = array(
        'labels'              => $labels,
        'public'              => true,
        'publicly_queryable'  => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_rest'        => true,
        'query_var'           => true,
        'rewrite'             => array('slug' => 'board-animation'),
        'capability_type'     => 'post',
        'has_archive'         => true,
        'hierarchical'        => false,
        'menu_position'       => 20,
        'menu_icon'           => 'dashicons-admin-customizer',
        'supports'            => array('title', 'editor', 'thumbnail', 'custom-fields')
    );
    
    register_post_type('board_animation', $args);
    
    // Flush rewrite rules only once
    if (get_option('board_animation_flush_rewrite') !== 'done') {
        flush_rewrite_rules();
        update_option('board_animation_flush_rewrite', 'done');
    }
}

// Add meta boxes for board messages
add_action('add_meta_boxes', 'add_board_animation_meta_boxes');
function add_board_animation_meta_boxes() {
    add_meta_box('board_messages', 'Board Messages', 'board_messages_callback', 'board_animation');
    add_meta_box('completion_message', 'Completion Message', 'completion_message_callback', 'board_animation');
}

function board_messages_callback($post) {
    wp_nonce_field('board_messages_nonce', 'board_messages_nonce');
    $messages_text = get_post_meta($post->ID, '_board_messages', true);
    
    // If it's an array, convert it back to quoted format for display
    if (is_array($messages_text) && !empty($messages_text)) {
        $messages_text = implode(',', array_map(function($msg) {
            // Convert newline markers back to newlines for display
            $msg = str_replace('{{NEWLINE}}', "\n", $msg);
            return '"' . $msg . '"'; // Don't escape HTML for display
        }, $messages_text));
    }
    
    echo '<div style="margin: 20px 0;">';
    echo '<label style="font-weight: bold; display: block; margin-bottom: 10px;">Board Messages:</label>';
    echo '<p style="color: #666; margin-bottom: 15px;">Enter your messages below using quotes as separators. Each quoted message will be displayed on the boards.</p>';
    echo '<p style="color: #666; margin-bottom: 15px;"><strong>Format:</strong> "Message 1","Message 2","Message 3","Message 4","Message 5","Message 6"</p>';
    echo '<p style="color: #666; margin-bottom: 15px;"><strong>Example:</strong> "Hello World","Welcome Back","This is fun","Keep going","Almost there","Final message"</p>';
    echo '<p style="color: #666; margin-bottom: 15px;"><strong>Newlines:</strong> Use \\n for line breaks or &lt;br/&gt; for HTML breaks within messages.</p>';
    echo '<p style="color: #666; margin-bottom: 15px;"><strong>Example with newlines:</strong> "First line\\nSecond line","Message with&lt;br/&gt;break"</p>';
    echo '<p style="color: #666; margin-bottom: 15px;"><strong>Flexible:</strong> You can enter any number of messages (2 minimum, 100+ supported).</p>';
    echo '<p style="color: #666; margin-bottom: 15px;"><strong>Large lists:</strong> For 42+ items, the rotation will be longer but smooth.</p>';
    echo '<p style="color: #666; margin-bottom: 15px;"><strong>Important:</strong> Commas within quoted text will be preserved. Only commas outside quotes separate messages.</p>';
    
    // Show current message count if we have messages
    if (is_array($messages_text) && !empty($messages_text)) {
        $message_count = count($messages_text);
        echo '<div style="background: #e7f3ff; border: 1px solid #0073aa; padding: 10px; margin: 15px 0; border-radius: 4px;">';
        echo '<strong>Current Status:</strong> ' . $message_count . ' message' . ($message_count !== 1 ? 's' : '') . ' loaded successfully.';
        echo '</div>';
    }
    
    // Use WordPress rich text editor with enhanced formatting
    wp_editor(
        $messages_text,
        'board_messages_text',
        array(
            'textarea_name' => 'board_messages_text',
            'textarea_rows' => 15,
            'media_buttons' => false,
            'teeny' => false, // Use full editor for better formatting
            'tinymce' => array(
                'toolbar1' => 'formatselect,bold,italic,underline,strikethrough,|,bullist,numlist,|,link,unlink,|,undo,redo',
                'toolbar2' => 'alignleft,aligncenter,alignright,|,outdent,indent,|,hr,|,removeformat,|,charmap,|,paste,|,cleanup',
                'toolbar3' => '',
                'toolbar4' => '',
                'forced_root_block' => 'p', // Allow paragraph breaks
                'force_br_newlines' => false, // Use proper paragraph breaks
                'force_p_newlines' => true, // Force paragraph breaks
                'convert_newlines_to_brs' => false, // Don't convert newlines to <br>
            ),
            'quicktags' => array(
                'buttons' => 'strong,em,link,ul,ol,li,close,ins,del,more,close'
            ),
            'wpautop' => false, // Don't auto-add paragraphs
            'textarea_rows' => 15, // More rows for better editing
        )
    );
    
    echo '</div>';
}

function completion_message_callback($post) {
    wp_nonce_field('completion_message_nonce', 'completion_message_nonce');
    $completion_message = get_post_meta($post->ID, '_completion_message', true);
    
    echo '<div style="margin: 20px 0;">';
    echo '<label style="font-weight: bold; display: block; margin-bottom: 10px;">Completion Message:</label>';
    echo '<p style="color: #666; margin-bottom: 15px;">Enter the message that will be displayed after the board animation completes. This replaces the default "🎉 You made it! 🎉" message.</p>';
    echo '<p style="color: #666; margin-bottom: 15px;"><strong>Tip:</strong> You can use HTML formatting, emojis, and styling to create a custom completion message.</p>';
    
    // Use WordPress rich text editor
    wp_editor(
        $completion_message,
        'completion_message_text',
        array(
            'textarea_name' => 'completion_message_text',
            'textarea_rows' => 8,
            'media_buttons' => false,
            'teeny' => false,
            'tinymce' => array(
                'toolbar1' => 'formatselect,bold,italic,underline,strikethrough,|,bullist,numlist,|,link,unlink,|,undo,redo',
                'toolbar2' => 'alignleft,aligncenter,alignright,|,outdent,indent,|,hr,|,removeformat,|,charmap,|,paste,|,cleanup',
                'forced_root_block' => 'p',
                'force_br_newlines' => false,
                'force_p_newlines' => true,
                'convert_newlines_to_brs' => false,
            ),
            'quicktags' => array(
                'buttons' => 'strong,em,link,ul,ol,li,close,ins,del,more,close'
            ),
            'wpautop' => false,
        )
    );
    
    echo '</div>';
}

add_action('save_post', 'save_board_animation_meta');
function save_board_animation_meta($post_id) {
    if (!isset($_POST['board_messages_nonce']) || !wp_verify_nonce($_POST['board_messages_nonce'], 'board_messages_nonce')) {
        return;
    }
    
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    if (isset($_POST['board_messages_text'])) {
        // Get the raw HTML input
        $raw_messages = $_POST['board_messages_text'];
        
        // First, decode HTML entities
        $plain_text = html_entity_decode($raw_messages, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        // Handle paragraph breaks and newlines properly
        $plain_text = str_replace('</p><p>', "\n\n", $plain_text);
        $plain_text = str_replace('<p>', '', $plain_text);
        $plain_text = str_replace('</p>', '', $plain_text);
        $plain_text = str_replace('<br>', "\n", $plain_text);
        $plain_text = str_replace('<br/>', "\n", $plain_text);
        $plain_text = str_replace('<br />', "\n", $plain_text);
        
        // Clean up list formatting that WordPress might add
        $plain_text = preg_replace('/<ol[^>]*>.*?<\/ol>/s', '', $plain_text); // Remove ordered lists
        $plain_text = preg_replace('/<ul[^>]*>.*?<\/ul>/s', '', $plain_text); // Remove unordered lists
        $plain_text = preg_replace('/<li[^>]*>(.*?)<\/li>/s', '$1', $plain_text); // Extract list items
        $plain_text = preg_replace('/<div[^>]*>(.*?)<\/div>/s', '$1', $plain_text); // Extract div content
        
        // Remove any remaining HTML tags that might contain numbering
        $plain_text = preg_replace('/<[^>]*>/', '', $plain_text);
        
        // Clean up any remaining formatting artifacts
        $plain_text = preg_replace('/^\s*\d+\.?\s*/m', '', $plain_text); // Remove leading numbers like "1. " or "1 "
        $plain_text = preg_replace('/^\s*[a-z]\.?\s*/m', '', $plain_text); // Remove leading letters like "a. " or "a "
        $plain_text = preg_replace('/^\s*[ivx]+\.?\s*/m', '', $plain_text); // Remove leading roman numerals like "i. " or "v "
        
        // Clean up extra whitespace but preserve intentional newlines
        $plain_text = str_replace('&nbsp;', ' ', $plain_text);
        
        // Final cleanup
        $plain_text = trim($plain_text);
        
        // Convert literal \n strings to actual newlines
        $plain_text = str_replace('\\n', "\n", $plain_text);
        
        // Convert newlines to special markers that WordPress won't strip
        $plain_text = str_replace("\n", "{{NEWLINE}}", $plain_text);
        
        // Don't strip HTML tags - keep them for proper rendering
        
        // Smart parsing: handle commas within quoted text properly
        $messages = array();
        $current_message = '';
        $in_quotes = false;
        $escape_next = false;
        
        // First, let's try a more robust approach using regex to properly parse quoted strings
        // This handles nested quotes and commas within quotes better than character-by-character parsing
        
        // Pattern to match quoted strings, handling escaped quotes and commas within quotes
        $pattern = '/"((?:[^"\\\\]|\\\\.)*)"/';
        
        if (preg_match_all($pattern, $plain_text, $matches)) {
            
            // Extract all quoted messages
            foreach ($matches[1] as $index => $match) {
                // Unescape escaped characters
                $message = str_replace('\\"', '"', $match);
                $message = str_replace('\\n', "\n", $message);
                $message = str_replace('\\\\', '\\', $message);
                
                // Clean up the message
                $clean_message = trim($message);
                if (!empty($clean_message)) {
                    $messages[] = $clean_message;
                }
            }
        } else {
            // Fallback to character-by-character parsing if regex fails
            
            // Let's also try a simpler regex pattern as a second attempt
            $simple_pattern = '/"([^"]*)"/';
            
            if (preg_match_all($simple_pattern, $plain_text, $simple_matches)) {
                foreach ($simple_matches[1] as $index => $match) {
                    $clean_message = trim($match);
                    if (!empty($clean_message)) {
                        $messages[] = $clean_message;
                    }
                }
            } else {
                
                // Character-by-character parsing as last resort
                for ($i = 0; $i < strlen($plain_text); $i++) {
                    $char = $plain_text[$i];
                    
                    if ($escape_next) {
                        // Handle escaped characters
                        if ($char === 'n') {
                            $current_message .= "\n";
                        } elseif ($char === '"') {
                            $current_message .= '"';
                        } elseif ($char === '\\') {
                            $current_message .= '\\';
                        } else {
                            $current_message .= '\\' . $char; // Keep unknown escapes
                        }
                        $escape_next = false;
                    } elseif ($char === '\\') {
                        $escape_next = true;
                    } elseif ($char === '"') {
                        $in_quotes = !$in_quotes;
                    } elseif ($char === ',' && !$in_quotes) {
                        // End of message (comma outside quotes)
                        $clean_message = trim($current_message);
                        if (!empty($clean_message)) {
                            // Remove surrounding quotes if present
                            $clean_message = trim($clean_message, '"');
                            $messages[] = $clean_message;
                        }
                        $current_message = '';
                    } else {
                        $current_message .= $char;
                    }
                }
                
                // Don't forget the last message
                $clean_message = trim($current_message);
                if (!empty($clean_message)) {
                    $clean_message = trim($clean_message, '"');
                    $messages[] = $clean_message;
                }
            }
        }
        
        // Remove duplicates and reindex
        $messages = array_values(array_unique($messages));
        
        // Validate message count and content
        if (count($messages) < 2) {
            // Minimum 2 messages required
        } elseif (count($messages) > 100) {
            // Very large numbers may affect performance
        }
        
        // Additional validation: Check for common parsing issues
        if (empty($messages)) {
            // No messages parsed - this indicates a parsing failure
        } else {
            // Check for potential issues in parsed messages
            foreach ($messages as $index => $message) {
                if (strpos($message, ',') !== false) {
                    // Message contains commas
                }
                if (empty(trim($message))) {
                    // Message is empty or whitespace only
                }
            }
        }
        
        // Store as simple array (not JSON) to avoid encoding issues
        update_post_meta($post_id, '_board_messages', $messages);
        
        // Also store as JSON as a backup to ensure data integrity
        $json_messages = json_encode($messages, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        update_post_meta($post_id, '_board_messages_json', $json_messages);
        
        // Verify what was stored
        $stored_messages = get_post_meta($post_id, '_board_messages', true);
        
        // Test immediate retrieval to see if there's corruption
        if (is_array($stored_messages)) {
            // Messages stored and retrieved as array successfully
        } else {
            // Messages not stored as array - try to recover from JSON backup
            $json_backup = get_post_meta($post_id, '_board_messages_json', true);
            if ($json_backup) {
                $recovered_messages = json_decode($json_backup, true);
                if (is_array($recovered_messages)) {
                    update_post_meta($post_id, '_board_messages', $recovered_messages);
                }
            }
        }
    }
    
    // Save completion message
    if (isset($_POST['completion_message_nonce']) && wp_verify_nonce($_POST['completion_message_nonce'], 'completion_message_nonce')) {
        if (isset($_POST['completion_message_text'])) {
            $completion_message = wp_kses_post($_POST['completion_message_text']);
            update_post_meta($post_id, '_completion_message', $completion_message);
        }
    }
}

// Enqueue styles and scripts for board animation
add_action('wp_enqueue_scripts', 'enqueue_board_animation_assets');
function enqueue_board_animation_assets() {
    global $post;
    $is_board_animation_post = is_singular('board_animation');
    $has_shortcode = !empty($post) && is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'board_animation_trigger');

    if ($is_board_animation_post || $has_shortcode) {
        wp_enqueue_style(
            'board-animation-style',
            get_stylesheet_directory_uri() . '/css/board-animation.css',
            array(),
            '1.0.2' // Version bump for cache busting
        );

        wp_enqueue_script(
            'board-animation-script',
            get_stylesheet_directory_uri() . '/board-animation.js',
            array('jquery'),
            '1.0.51', // Version bump for cache busting
            true
        );

        $post_id_to_load = 0;
        if ($is_board_animation_post) {
            $post_id_to_load = get_the_ID();
        } elseif ($has_shortcode) {
            // Find the post_id from the shortcode attribute
            preg_match('/\[board_animation_trigger.*?post_id="(\d+)"/', $post->post_content, $matches);
            if (isset($matches[1])) {
                $post_id_to_load = intval($matches[1]);
            }
        }

        $board_messages = array();
        if ($post_id_to_load > 0) {
            $board_messages = get_post_meta($post_id_to_load, '_board_messages', true);

            if (!is_array($board_messages)) {
                $json_backup = get_post_meta($post_id_to_load, '_board_messages_json', true);
                if ($json_backup) {
                    $recovered_messages = json_decode($json_backup, true);
                    if (is_array($recovered_messages)) {
                        $board_messages = $recovered_messages;
                    }
                }
            }

            if (is_array($board_messages)) {
                $board_messages = array_map(function($msg) {
                    return str_replace('{{NEWLINE}}', "\n", $msg);
                }, $board_messages);
            } else {
                $board_messages = array();
            }
        }

        wp_localize_script('board-animation-script', 'boardAnimationData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('board_animation_nonce'),
            'messages' => $board_messages
        ));
    }
}





/**
 * Board Animation Pop-up System
 * Display board animation custom posts in a pop-up
 */

// Shortcode to trigger board animation pop-up
add_shortcode('board_animation_trigger', 'board_animation_trigger_shortcode');
function board_animation_trigger_shortcode($atts) {
    $atts = shortcode_atts(array(
        'post_id' => '',
        'button_text' => 'View Animation',
        'button_class' => 'wp-block-button__link'
    ), $atts);
    
    if (empty($atts['post_id']) || !is_numeric($atts['post_id'])) {
        return '<p style="color: red; font-weight: bold;">Error: Board animation shortcode requires a valid post_id. Example: [board_animation_trigger post_id="123"]</p>';
    }
    
    $post = get_post(intval($atts['post_id']));
    if (!$post || $post->post_type !== 'board_animation') {
        return '<p style="color: red; font-weight: bold;">Error: Invalid post ID or not a board animation post. Please check the post_id.</p>';
    }
    
    $output = '<button class="board-animation-trigger ' . esc_attr($atts['button_class']) . '" ';
    $output .= 'data-animation-id="' . esc_attr($atts['post_id']) . '" ';
    $output .= 'type="button">';
    $output .= esc_html($atts['button_text']);
    $output .= '</button>';
    
    return $output;
}

// AJAX handler to load board animation content
add_action('wp_ajax_load_board_animation', 'load_board_animation_ajax');
add_action('wp_ajax_nopriv_load_board_animation', 'load_board_animation_ajax');
function load_board_animation_ajax() {
    check_ajax_referer('board_animation_nonce', 'nonce');
    
    $post_id = intval($_POST['post_id']);
    $post = get_post($post_id);
    
    if (!$post || $post->post_type !== 'board_animation') {
        wp_send_json_error('Invalid post');
    }
    
    // Get the post content
    $content = apply_filters('the_content', $post->post_content);
    
    // Get custom fields if needed
    $custom_data = array(
        'title' => $post->post_title,
        'content' => $content,
        'featured_image' => get_the_post_thumbnail_url($post_id, 'large'),
        // Add any custom meta fields here
        'animation_speed' => get_post_meta($post_id, 'animation_speed', true),
        'grid_size' => get_post_meta($post_id, 'grid_size', true),
    );
    
    wp_send_json_success($custom_data);
}

// Enqueue board animation pop-up scripts
add_action('wp_enqueue_scripts', 'enqueue_board_animation_popup');
function enqueue_board_animation_popup() {
    $version = wp_get_theme()->get('Version');
    
    // // Pop-up CSS
    // wp_enqueue_style(
    //     'board-animation-popup',
    //     get_stylesheet_directory_uri() . '/css/board-animation-popup.css',
    //     array(),
    //     $version
    // );
    
    // // Pop-up JS
    // wp_enqueue_script(
    //     'board-animation-popup',
    //     get_stylesheet_directory_uri() . '/js/board-animation-popup.js',
    //     array('jquery'),
    //     $version,
    //     true
    // );
    
    // Localize script
    wp_localize_script('board-animation-popup', 'boardAnimationData', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('board_animation_nonce'),
    ));
}

// Add pop-up container to footer
add_action('wp_footer', 'board_animation_popup_container');
function board_animation_popup_container() {
    ?>
    <div id="board-animation-modal" class="board-modal">
        <div class="board-modal-content">
            <button id="close-board-modal" class="board-modal-close" aria-label="Close">&times;</button>
            <div class="board-modal-body">
                <div class="board-modal-loading">Loading...</div>
            </div>
        </div>
    </div>
    <?php
}