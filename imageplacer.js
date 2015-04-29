function ordinal_to_x(len_x, len_y, ordinal) {
	return ordinal % len_x;
}

function ordinal_to_y(len_x, len_y, ordinal) {
	return Math.floor(ordinal/len_x);
}

function remove_radius_around_element(i, r, p_x, p_y, points) {
	// This special function is needed because we won't know where the elements
	// with the ordinals to be removed are located. Their indices are no longer
	// the same as their ordinals as previous element could have been removed
	var ordinal = points[i];
	var x = ordinal_to_x(p_x, p_y, ordinal);
	var y = ordinal_to_y(p_x, p_y, ordinal);
	
	var min_search_i = Math.max(0, i - r*p_x - r);
	var max_search_i = Math.min(points.length, i + r*p_x + r);
	
	for (var search_i = max_search_i; search_i >= min_search_i; search_i--) {
		search_ordinal = points[search_i];
		search_x = ordinal_to_x(p_x, p_y, search_ordinal);
		search_y = ordinal_to_y(p_x, p_y, search_ordinal);
		
		if ((x - r <= search_x) && (search_x <= x + r)) {
			// x is within range
			if ((y - r <= search_y) && (search_y <= y + r)) {
				// y is within range
				points.splice(search_i, 1);
// 					alert('search i:' + search_i + ' so:' + search_ordinal + ' x:' + x + ' sx:' + search_x);
			}
		}
	}
}

function check_for_overlap(image_x, image_y, w_b, h_b, matrix) {
	var highest_value = 0;
	
	var s_w_b = w_b;
	var s_h_b = h_b;
	var a = Math.atan((s_w_b/2)/s_h_b);
	
	for (var rel_y = 0; rel_y <= s_h_b; rel_y++) {
		if (image_y + rel_y >= matrix[0].length) {
			break;
		}
		
		var h = s_h_b - rel_y;
		var w = 2*Math.ceil(h*Math.tan(a));
		
		var rel_x_start = Math.ceil((s_w_b - w)/2); 
		
		for (var rel_x = 0; rel_x <= w; rel_x++) {
			if (image_x + rel_x_start + rel_x >= matrix.length) {
				break;
			}
			//highest_value = Math.max(highest_value, matrix[image_x + rel_x_start + rel_x][image_y + rel_y]);
		}
	}
	return highest_value;
}

function flag_for_overlap(image_x, image_y, w_b, h_b, scale, matrix, overlap_factor) {
	var s_w_b = w_b*scale;
	var s_h_b = h_b*scale;
	var a = Math.atan((s_w_b/2)/(s_h_b/2));
	
	for (var rel_y = 0; rel_y <= s_h_b; rel_y++) {
		if (image_y + rel_y >= matrix[0].length) {
			break;
		}
		
		var w;
		var rel_x_start;
		if (rel_y > s_h_b/2) {
			var h = s_h_b - rel_y;
			w = 2*Math.ceil(h*Math.tan(a));
			
			rel_x_start = Math.ceil((s_w_b - w)/2); 
		} else {
			w = s_w_b;
			rel_x_start = 0;
		}
		for (var rel_x = 0; rel_x <= w; rel_x++) {
			if (image_x + rel_x_start + rel_x >= matrix.length) {
				break;
			}
			//matrix[image_x + rel_x_start + rel_x][image_y + rel_y] = overlap_factor + 1;
		}
	}
}

function fade_in_images(images, delay) {
	var next_image_to_show = images.pop();
	next_image_to_show.fadeIn(delay, function() {
		fade_in_images(images, delay);
	})
}

(function( $ ){
   $.fn.imageplacer = function(ao_images, template_img) {
	   var debug = false;
	   
	   if (debug) {
		   this.css('background-color', 'rgba(0,0,0,0.2');
	   }
	   
	   this.css('position', 'relative');
	   
	   template_img.hide();
	  
	   // available width and height
	   var w_full_container = this.width();
	   var h_full_container = this.height();
	   var A_full_container = w_full_container * h_full_container // px²
	   
	   // Image width/height ratio
	   var w_orig_image_img = template_img.width();
	   var h_orig_image_img = template_img.height();
	   var wh_ratio_image = w_orig_image_img / h_orig_image_img;
	   
	   // Approximate surface area covered by images
	   var c = 0.8;
	   
	   
	   
	   // c * A_container = ao_images * A_image
	   // A_image = c * A_container / ao_images = w_image * h_image
	   // w_image / h_image = wh_ratio_image => h_image = w_image / wh_ratio_image
	   var w_image = Math.sqrt((wh_ratio_image * c * A_full_container) / ao_images);
	   var h_image = w_image / wh_ratio_image;
	   
	   // We set a maximum value for the height to prevent edge cases
	   if (h_image > 0.6 * h_full_container) {
		   h_image = 0.6 * h_full_container;
		   w_image = h_image * wh_ratio_image;
	   }
	   
	   // Useable dimension of the container (padding provided for edge images)
	   var w_container = w_full_container - w_image;
	   var h_container = h_full_container - h_image;
	   
	   if (debug) {
		   console.log('Container width: ' + w_container);
		   console.log('Container height: ' + h_container);
		   console.log('image img width: ' + w_image);
		   console.log('image img height: ' + h_image);
	   }
	   
	   // Points contained in 1 image
	   var p_x_image = 10;
	   var p_y_image = Math.round(p_x_image / wh_ratio_image);
	   
	   // Total points on the grid
	   var p_x = Math.floor((w_container / w_image) * p_x_image);
	   var p_y = Math.floor((h_container / h_image) * p_y_image);
	   var p_tot = p_x * p_y;
	   if (debug) {
		   console.log('Points per image: ' + p_x_image + 'x' + p_y_image);
		   console.log('Points in container: ' + p_x + 'x' + p_y);
	   }
	   
	   // Distance between points on the grid
	   var d_x = w_container / p_x;
	   var d_y = h_container / p_y;
	   
	   // image bookkeeping data structures
	   var points = [];
	   var grid = [];
	   var i_point = 0;
	   
	   for (var x = 0; x < p_x; x++) {
		   var x_points = [];
		   for (var y = 0; y < p_y; y++) {
			   points[i_point] = 0;
			   i_point++;
			   
			   x_points[y] = 0;
			   
			   if (debug) {
				   // Show this point on the grid
				   var dot = $('<div></div>');
				   dot.css({'background-color': '#333',
					   		'position': 'absolute',
					   		'top': y*d_y + 'px',
					   		'left': x*d_x + 'px',
					   		'width': '2px',
					   		'height': '2px'
				   });
				   this.append(dot);
			   }
		   }
		   grid[x] = x_points;
	   }
	   
	   var points_left = points.length;
	   var images = [];
	   for (var n = 0; n < ao_images; n++) {
		   var i_point_next_image = Math.floor(Math.random() * points_left);
		   
		   // Find the nth free point in the points array where 
		   // n = i_point_next_image
		   var free_points = 0;
		   var i_point = 0;
		   while (free_points < i_point_next_image) {
			   if (points[i_point] <= 0)
				   free_points++;
			   
			   i_point++;
		   }
		   // Set this point as taken
		   points[i_point] = 1;
		   points_left --;
		   
		   // Calculate the x and y coordinate of this point
		   var x_image = i_point % p_x;
		   var y_image = Math.floor(i_point / p_x);
		   
		   // Check every point in the grid where this image will be for
		   // the presence other images
		   var z_min = 0;
		   for (var y_offset=0; y_offset < p_y_image; y_offset++) {
			   y = y_image + y_offset;
			   if (y >= p_y)
				   continue;
			   
			   for (var x_offset=0; x_offset < p_x_image; x_offset++) {
				   // This is to take the form of the image into account
				   if (y_offset / p_y_image > 2/3) {
					   if ((x_offset / p_x_image < 1/3) || (x_offset / p_x_image > 2/3))
						   continue;
				   }
				   
				   x = x_image + x_offset;
				   if (x >= p_x)
					   continue;
				   
				   if (grid[x][y] < z_min)
					   z_min = grid[x][y]
			   }
		   }
		   var z_image = z_min;
		   
		   var z_value_scaling_factor = 0.8;
		   
		   var w_image_scaled = w_image * Math.pow(z_value_scaling_factor, -z_image);
		   var h_image_scaled = h_image * Math.pow(z_value_scaling_factor, -z_image);
		   
		   var p_x_image_scaled = Math.ceil(w_image_scaled / d_x);
		   var p_y_image_scaled = Math.ceil(h_image_scaled / d_y);
		   
		   // Set the new z value for every point in the grid
		   // where this image will be
		   for (var y_offset=0; y_offset < p_y_image_scaled; y_offset++) {
			   y = y_image + y_offset;
			   if (y >= p_y)
				   continue;
			   for (var x_offset=0; x_offset < p_x_image_scaled; x_offset++) {
				   // This is to take the form of the image into account
				   if (y_offset / p_y_image > 2/3) {
					   if ((x_offset / p_x_image < 1/3) || (x_offset / p_x_image > 2/3))
						   continue;
				   }
				   
				   x = x_image + x_offset;
				   if (x >= p_x)
					   continue;
				   
				   grid[x][y] = z_image - 1;

				   if (debug) {
					   // Put a color over it
					   var dot = $('<div></div>');
					   dot.css({'background-color': 'white',
						   		'position': 'absolute',
						   		'top': y*d_y + 'px',
						   		'left': x*d_x + 'px',
						   		'width': '2px',
						   		'height': '2px'
					   });
					   this.append(dot);
				   }
			   }
		   }
		   
		   var new_image = template_img.clone().removeAttr('id').addClass('new-image').hide();
		   
		   new_image.css({
			   'position': 'absolute',
			   'top': y_image * d_y,
			   'left': x_image * d_x,
			   'width': w_image_scaled + 'px',
			   'z-index': 1000 + z_image
		   });
		   
		   if (debug) {
			   new_image.css('background-color', 'rgba(255, 0, 0, .5');
		   }
		   
		   images.push(new_image);
		   this.append(new_image);
	   }
	   
	   fade_in_images(images, 10000 / ao_images);
	  
	   return this;
   }; 
})( jQuery );