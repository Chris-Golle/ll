// (function ($) {
//     $(document).ready(function () {
//         $('#showing_all_cats').hide();
//         $('#show_main_cats').hide();

//         $('#show_main_cats').on('click', function () {
//             $('#showing_main_cats').show();
//             $('#showing_all_cats').hide();
//             $('#show_main_cats').hide();
//             $('#show_all_cats').show();
//         })
//         $('#show_all_cats').on('click', function () {
//             $('#showing_main_cats').hide();
//             $('#showing_all_cats').show();
//             $('#show_main_cats').show();
//             $('#show_all_cats').hide();
//         })
//     })
// })(jQuery);

// the quiz code happens in jquery otherwise we look for elements that have not yet loaded
jQuery(document).ready(function ($) {
  // show reset button only on results page
  if (window.location.href.indexOf('quiz=') > -1) {
    $('.quiz-taken').show();
    $('.quiz-not-taken').hide();
  } else {
    $('.quiz-taken').hide();
    $('.quiz-not-taken').show();
  }
  // launch quiz if the url of look-at-you contains quiz, but not if it's a results page 
  // if (window.location.href.indexOf('look-at-you') > -1 && window.location.href.indexOf('quiz') > -1 && window.location.href.indexOf('quiz=') == -1) {
  //   var quizAnswers = '';
  //   // var quizQuestions = [141476, 141580, 141671, 141486, 141597];
  //   // launchQuiz(0);
  //   document.addEventListener("click", someListener);
  //   function someListener(event) {
  //     var element = event.target.closest('.uagb-buttons__outer-wrap');
  //     console.log(element.id);
  //     if (element.id.split('-')[0] == 'quiz') {
  //       console.log("doing");
  //       var questionNb = parseInt(element.id.split('-')[1]);
  //       var answerNb = parseInt(element.id.split('-')[2]);
  //       console.log('questionNb ' + questionNb);
  //       console.log('answerNb ' + answerNb);
  //       quizAnswers += answerNb;
  //       // elementorProFrontend.modules.popup.closePopup({}, event);
  //       launchQuiz(questionNb + 1);
  //       // console.log('quizAnswers ' + quizAnswers);
  //     } else if (element.id == 'see-quiz-results') {
  //       // console.log("hi done");
  //       // elementorProFrontend.modules.popup.closePopup({}, event);
  //       // below line removes the # from the url, that was added by buttons clicked
  //       history.replaceState(null, null, ' ');
  //       // add the quiz results after the 'quiz' present in the url
  //       window.location.search += "=" + quizAnswers;
  //     }
  //   }
  // }

  if (window.location.href.indexOf('youth-short-sleeve-t-shirt') > -1) {
    // $('#pf-form-input-1').attr('placeholder', 'this is coded');
    $('iframe').contents().find('input#pf-form-input-1').attr('placeholder', 'coded');
  }
});

// when pop-up is detected, we get the region attribute that is saved in the #region element in the region shortcode, and apply css to the current region
jQuery(document).ready(function ($) {
  // Highlight current region if region pop-up exists
  if ($('.region-pop-up').length) {
    var region = $('#region').attr('region');
    if (region) {
      $('#region-' + region).attr('id', 'current_region');
    }
  }
  
  // Initialize: hide pop-up and close button on page load (only if they exist)
  var $changeRegion = $('#change_region');
  var $closeRegion = $('#close-region');
  
  if ($changeRegion.length) {
    $changeRegion.hide();
  }
  
  if ($closeRegion.length) {
    $closeRegion.hide();
    
    // Close button click handler
    $closeRegion.on('click', function() {
      $changeRegion.hide();
      $(this).hide();
    });
  }
});

// Toggle region switcher pop-up
function chrisToggleRegion() {
  var $popup = jQuery('#change_region');
  var $closeBtn = jQuery('#close-region');
  
  // Only proceed if elements exist
  if (!$popup.length || !$closeBtn.length) {
    console.warn('Region switcher elements not found');
    return;
  }
  
  if ($popup.is(':visible')) {
    $popup.removeClass('show').hide();
    $closeBtn.hide();
    jQuery('body').css('overflow', '');
  } else {
    $popup.addClass('show').css('display', 'flex');
    $closeBtn.css('display', 'flex');
    jQuery('body').css('overflow', 'hidden');
  }
}
// function toggleCoupon() {
//   var x = document.getElementsByClassName("coupon")[0];
//   if (x.style.display == "block") {
//     x.style.display = "none";
//   } else {
//     x.style.display = "block";
//   }
// }

function addDots(strings) {
  return strings.reduce((result, string) => {
    result.push(string, " .".repeat(string.length));
    return result;
  }, []);
}

// typewriter https://alvarotrigo.com/blog/css-text-animations/ and some GPT
function wordflick(strings) {
  jQuery(document).ready(function ($) {
    // $('.typewriter').text('');

    // var categoryTitles = [];
    // $('.woocommerce-loop-category__title h2').each(function() {
    //   categoryTitles.push($(this).text());
    // });
    // console.log(categoryTitles);

    var words = addDots(strings),
      part,
      i = 0,
      offset = 0,
      len = words.length,
      forwards = true,
      skip_count = 0,
      skip_delay = 15,
      speed = 70;
    setInterval(function () {
      if (forwards) {
        if (offset >= words[i].length) {
          ++skip_count;
          if (skip_count == skip_delay) {
            forwards = false;
            skip_count = 0;
          }
        }
      }
      else {
        if (offset == 0) {
          forwards = true;
          i++;
          offset = 0;
          if (i >= len) {
            i = 0;
          }
        }
      }
      part = words[i].substr(0, offset);
      if (skip_count == 0) {
        if (forwards) {
          offset++;
        }
        else {
          offset--;
        }
      }
      $('.typewriter').text(part);
    }, speed);
  });
};

jQuery(document).ready(function ($) {
    window.addEventListener('message', function (event) {
        if (event.origin !== window.location.origin) return;

        if (event.data?.action === 'cart_updated') {
            sessionStorage.setItem('cart_updated_in_overlay', '1');
        }
    });

    // Product Fullscreen Overlay
    $(document.body).on('click', '.product-fullscreen-button', function (e) {
        e.preventDefault();

        var productUrl = $(this).data('product-url');
        if (!productUrl) {
            return;
        }

        var overlayUrl = new URL(productUrl);
        overlayUrl.searchParams.set('overlay_mode', '1');

        // Create overlay elements
        var $overlay = $('<div class="product-overlay-container"></div>');
        var $spinner = $('<div class="product-overlay-spinner">Loading...</div>');
        var $iframe = $('<iframe src="' + overlayUrl.href + '"></iframe>');
        var $closeButton = $('<button class="product-overlay-close">&times;</button>');

        // Append to body
        $overlay.append($spinner).append($iframe).append($closeButton).appendTo('body');

        // Lock body scroll
        $('html, body').css('overflow', 'hidden');

        // Handle iframe load
        $iframe.on('load', function () {
            $spinner.hide();
            $iframe.css('opacity', '1');
        });
    });

    function closeOverlay() {
        const updated = sessionStorage.getItem('cart_updated_in_overlay');

        if (updated === '1') {
            sessionStorage.removeItem('cart_updated_in_overlay');
            window.location.reload(); // REQUIRED for block themes
            return;
        }

        $('.product-overlay-container').remove();
        $('html, body').css('overflow', '');
    }

    // Delegated close button
    $(document.body).on('click', '.product-overlay-close', closeOverlay);

    // Escape key
    $(document).on('keyup', function (e) {
        if (e.key === 'Escape') closeOverlay();
    });
});
