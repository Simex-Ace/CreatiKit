// GIF.js Worker
// This is a simplified worker for GIF.js

// LZW encoder implementation
function lzw_encode(imageData, lzwMinCodeSize) {
  var a = [];
  var data = imageData;
  var pos = 0;
  var clear_code = 1 << lzwMinCodeSize;
  var eoi_code = clear_code + 1;
  var next_code = clear_code + 2;
  var bits_per_code = lzwMinCodeSize + 1;
  var max_code = 1 << bits_per_code;
  var prev_code = null;
  var hash_table = {};
  
  // Write code to output buffer
  function write_code(code) {
    var mask;
    for (mask = 1; mask < (1 << bits_per_code); mask <<= 1);
    do {
      mask >>>= 1;
      a[pos >> 3] |= ((code & mask) ? 1 : 0) << (7 - (pos & 7));
      pos++;
    } while (mask > 1);
  }
  
  // Initialize with clear code
  write_code(clear_code);
  
  // Process pixel stream
  var pixel_pos = 0;
  while (pixel_pos < data.length) {
    var key = prev_code === null ? '' : prev_code + ',';
    key += data[pixel_pos];
    
    if (hash_table.hasOwnProperty(key)) {
      prev_code = hash_table[key];
    } else {
      write_code(prev_code);
      hash_table[key] = next_code++;
      prev_code = data[pixel_pos];
      
      // Update code size if needed
      if (next_code >= max_code) {
        bits_per_code++;
        max_code = 1 << bits_per_code;
      }
      
      // Reset dictionary when full
      if (next_code === 4096) {
        write_code(clear_code);
        prev_code = null;
        next_code = clear_code + 2;
        bits_per_code = lzwMinCodeSize + 1;
        max_code = 1 << bits_per_code;
        hash_table = {};
      }
    }
    
    pixel_pos++;
  }
  
  // Write remaining code
  if (prev_code !== null) {
    write_code(prev_code);
  }
  
  // End of information code
  write_code(eoi_code);
  
  return a;
}

// Main message handler - compatible with gif.js format
self.onmessage = function(event) {
  try {
    var data = event.data;
    
    // Extract image data and parameters
    var imageData = data.data;
    var width = data.width;
    var height = data.height;
    var delay = data.delay || 100;
    var index = data.index;
    
    // Generate color palette (simplified for compatibility)
    var colorMap = [];
    var colorIndex = {};
    var palette = [];
    var pixelData = [];
    var maxColors = 256;
    var colorCount = 0;
    
    // Process each pixel to build color table
    for (var i = 0; i < imageData.length; i += 4) {
      var r = imageData[i];
      var g = imageData[i + 1];
      var b = imageData[i + 2];
      var a = imageData[i + 3];
      
      // Handle transparency
      if (a === 0) {
        r = g = b = 0; // Use black for transparent pixels
      }
      
      var colorKey = r + ',' + g + ',' + b;
      
      // Add color to palette if new
      if (!colorIndex.hasOwnProperty(colorKey) && colorCount < maxColors) {
        colorIndex[colorKey] = colorCount;
        colorMap.push(r);
        colorMap.push(g);
        colorMap.push(b);
        colorCount++;
      }
      
      // Add pixel index to data
      pixelData.push(colorIndex[colorKey] || 0);
    }
    
    // Ensure palette is padded to 256 colors (GIF requirement)
    while (colorMap.length < 768) { // 256 * 3
      colorMap.push(0);
    }
    
    // Calculate minimum code size (1-8 bits)
    var lzwMinCodeSize = Math.max(2, Math.ceil(Math.log(colorCount) / Math.log(2)));
    
    // Compress pixel data using LZW
    var compressedData = lzw_encode(pixelData, lzwMinCodeSize);
    
    // Create graphic control extension
    var gce = [
      0x21, // Extension introducer
      0xF9, // Graphic control label
      0x04, // Block size
      0,    // Disposal method
      (delay >> 8) & 0xFF, // Delay high byte
      delay & 0xFF,        // Delay low byte
      0,    // Transparent color index
      0     // Block terminator
    ];
    
    // Create image descriptor
    var id = [
      0x2C, // Image separator
      0, 0, // Left
      0, 0, // Top
      width & 0xFF, (width >> 8) & 0xFF, // Width
      height & 0xFF, (height >> 8) & 0xFF, // Height
      0x80 | Math.min(7, Math.ceil(Math.log(colorCount) / Math.log(2)) - 1) // Flags
    ];
    
    // Assemble frame data
    var frameData = gce
      .concat(id)
      .concat(colorMap)
      .concat([lzwMinCodeSize])
      .concat(compressedData)
      .concat([0]); // End of block
    
    // Send back the result in the format gif.js expects
    self.postMessage({
      data: frameData,
      index: index
    });
  } catch (error) {
    // Handle errors gracefully
    self.postMessage({
      error: error.message,
      index: event.data.index
    });
  }
};