var critical_alert_log = "";

// Wind bonus is power_required_reference vs headwind
const wind_bonus_table = [
    //60   70    80    90    100    110  120  130 %
    [1.0, 1.0,  0.5,  0.4,  0.4,   0.0,  0.0,  0.0], //5 kts
    [1.6, 2.0,  2.0,  2.0,  1.1,   0.8,  0.2,  0.4], // these last two numbers are weird but that's the chart.
    [4.0, 4.9,  4.9,  4.3,  2.6,   2.0,  1.1,  1.8], // 15 kts
    [6.5, 8.9,  8.6,  6.9,  5.0,   4.6,  4.5,  5.0], //20
    [9.0, 12.0, 13.5, 12.0, 10.5,  9.5,  9.5, 10.5], //25
    [10.0,10.0, 18.0, 19.0, 18.0, 19.0, 19.6, 21.5], //30
];
const wind_bonus_table_aa = [
    //60   70    80    90    100    110  120  130 %
    [0.9, 0.9,  0.9,  0.6,   0.3,   0.1, 0.0,  0.0], //5 kts   
    [2.0, 2.2,  2.6,  2.1,   1.3,   0.9, 0.2,  0.2], // 10
    [3.9, 4.9,  5.2,  4.8,   3.0,   2.0, 1.9,  2.1], // 15 kts
    [5.8, 8.9,  9.0,  8.9,   5.9,   4.5, 4.7,  5.0], // 20
    [7.2, 12.0, 13.5, 12.5, 10.8,   9.6, 9.6, 10.2], // 25 kts
    [9.2, 15.0, 18.0, 18.9, 18.8,  18.6,19.6, 20.9], // 30
];

const power_available_row_zero_index = 2;
const min_pa = -2000;
const max_pa =  14000;
const min_auw = 11000;
const max_auw = 15500; //because when do you ever hover out of ground effect at 15,600? And I don't want to look up all those extra numbers.
//SMM Annex B - Tq Available AA Off as limited by TIT or NG
// 2.5 minute Power available, min spec engines
const power_available_table = [
  // Each row is a PRESSURE altitude,
  // each column is a temp, starting at -40, stepping 5 degrees
  //  -35      -25     -15     -5  0   5       15      25      35 
  //40     -30     -20     -10             10      20      30      40
  [138,137,136,135,135,135,134,134,133,132,131,131,130,125,121,115,110], //-2000 (white line) (index 0)
  [138,137,136,135,135,135,134,134,133,132,131,129,126,121,117,111,106], // -1000 (between) 
  [137,136,136,135,135,135,134,134,133,132,131,126,122,116,112,106,101], // 0 (yellow) (index 2)
  [136,136,135,135,134,134,133,132,130,128,125,122,117,112,107,102,097],
  [135,135,135,134,134,133,132,130,126,123,120,116,112,107,102,097,092], // 2000 (cyan)
  [132,132,132,131,129,127,126,124,121,118,115,111,107,102,097,092,087],
  [130,130,130,127,125,123,120,118,116,113,110,106,102,097,093,088,083], // 4000 (green)
  [125,125,124,123,120,118,116,113,111,108,106,102,098,093,088,084,080],
  [122,120,119,117,115,113,111,108,106,104,101,097,093,088,085,080,076], // 6000 (purple)
  [117,115,114,112,110,108,107,104,102,098,097,093,089,085,082,  0,  0], //7000
  [112,111,110,108,105,104,102,100,097,095,092,088,085,082,078,  0,  0], //8000
  [108,106,105.103,101,100,098,096,093,091,088,085,082,077,075,  0,  0], //9000
  [103,102,101,099,097.096,094,092,090,087,085,082,078,075,072,  0,  0], //10 000
  [100,098,097,095,094,092,090,088,086,084,083,077,076,072,  0,  0,  0],
  [096,095,094,092,090,087,086,084,083,080,079,075,073,  0,  0,  0,  0], //12 000
  [092,090,089,088,087,084,083,080,079,077,075,072,  0,  0,  0,  0,  0],
  [089,087,086,085,083,081,079,077,076,073,071,  0,  0,  0,  0,   0,  0], //14000
];

const power_required_row_zero_index = 7;
const min_da = -7000;
const max_da = 12000;
const power_required_table = [
  // Each row is a DENSITY altitude,
  // each column is an AUW, starting at 11,000, ending at 15500
  //11   5     12    5     13    5     14    5     15    5  <- AUW
  [ 76.0, 71.0, 75.1, 79.2, 83.5, 88.0, 92.2, 96.9,101.5,106.1], //-7000 (index 0)
  [ 66.3, 70.5, 74.5, 78.8, 82.9, 87.0, 91.3, 95.9,103.5,105.0],
  [ 65.8, 69.9, 73.9, 77.9, 82.0, 86.1, 90.3, 94.9, 99.2,103.9],
  [ 67.6, 71.7, 75.9, 80.1, 84.5, 88.9, 93.2, 98.0,102.5,107.4], // -4000
  [ 68.2, 72.5, 76.5, 81.0, 85.1, 89.8, 94.2, 99.0,103.9,109.0], // -3 (index 4)
  [ 69.0, 73.1, 77.4, 81.7, 86.1, 90.8, 95.4,100.2,105.1,110.5], // -2
  [ 69.7, 73.9, 78.1, 82.5, 87.1, 91.7, 96.5,101.4,106.8,112.1], // -1000
  [ 70.2, 74.8, 79.0, 83.2, 88.0, 92.7, 97.8,103.0,108.3,114.0], // 0' (index 7, power_required_row_zero_index)
  [ 71.1, 75.2, 79.9, 84.2, 89.1, 94.0, 99.1,104.6,110.2,116.0], // 1
  [ 71.8, 76.1, 80.8, 85.4, 90.2, 95.3,100.7,106.3,112.2,118.1],  // 2 (index 10)
  [ 72.5, 77.0, 81.6, 86.4, 91.5, 95.8,102.4,108.2,114.1,120.0], //3
  [ 73.2, 77.9, 82.8, 87.6, 92.9, 98.4,104.2,110.1,116.0,122.1], // 4000 
  [ 74.1, 78.9, 83.8, 88.9, 94.3,100.0,106.0,112.0,118.1,124.4], // 5
  [ 75.0, 79.9, 85.0, 90.3, 96.0,102.0,107.9,114.0,120.3,127.0], // 6 
  [ 76.0, 81.0, 86.3, 92.0, 97.8,103.7,109.8,116.2,122.8,129.5], // 7000
  [ 77.0, 82.2, 87.9, 93.8, 99.6,105.7,112.0,118.5,125.3,    0], // 8 
  [ 78.1, 83.7, 89.4, 95.2,101.3,107.6,114.1,120.8,127.9,    0], // 9
  [ 79.6, 85.2, 91.1, 97.0,103.3,109.8,116.5,123.6,    0,    0], //10 
  [ 81.0, 86.9, 92.8, 98.9,105.3,112.0,119.0,126.3,    0,    0], //11
  [ 82.6, 88.4, 94.5,100.9,107.5,114.6,    0,    0,    0,    0], //12 
];
	
const power_required_table_aa = [
  // Each row is a DENSITY altitude,
  // each column is an AUW, starting at 11,000, ending at 15500
  //11   5     12    5     13    5     14    5     15    5  <- AUW
  [ 68.3, 72.3, 76.4, 80.5, 84.5, 88.8, 93.1, 97.4,101.8,106.3], // -7
  [ 69.0, 73.0, 77.1, 81.1, 85.3, 89.8, 94.0, 98.3,103.0,107.6], // -6
  [ 69.7, 73.8, 77.9, 82.0, 86.2, 90.5, 94.9, 99.3,104.0,108.8], // -5
  [ 70.2, 74.2, 78.4, 82.6, 87.0, 91.4, 95.8,100.3,105.0,110.0], // -4
  [ 71.0, 75.0, 79.1, 83.4, 87.8, 92.2, 96.8,101.4,106.2,111.4], // -3
  [ 71.5, 75.8, 80.0, 84.3, 88.6, 93.3, 98.0,102.9,107.9,113.1], // -2
  [ 72.2, 76.6, 80.8, 85.1, 89.9, 94.4, 99.1,104.2,109.6,115.0], // -1	
  [ 72.9, 77.2, 81.7, 86.0, 90.7, 95.5,100.4,105.5,111.0,116.8], // 0
  [ 73.9, 78.1, 82.4, 87.1, 92.0, 96.8,102.0,107.3,113.0,119.0], // 1
  [ 74.5, 78.9, 83.3, 88.0, 93.0, 98.0,103.4,109.1,115.0,120.8], // 2
  [ 75.0, 79.5, 84.1, 89.0, 94.0, 99.3,105.0,110.9,116.7,122.7], // 3
  [ 75.9, 80.4, 85.2, 90.1, 95.5,101.0,106.9,112.8,188.7,124.9], // 4
  [ 76.7, 81.4, 86.2, 91.5, 97.0,102.8,108.7,114.6,120.8,127.1], // 5
  [ 77.7, 82.4, 87.6, 93.0, 98.8,104.6,110.4,116.7,123.0,129.5], // 6
  [ 78.5, 83.5, 89.0, 94.5,100.3,106.3,112.3,118.8,125.2,    0], // 7 
  [ 79.5, 85.0, 90.5, 96.2,102.1,108.1,104.7,120.1,127.5,    0], // 8
  [ 80.7, 86.1, 92.0, 97.9,103.9,110.0,116.6,123.3,    0,    0], // 9
  [ 82.0, 87.8, 93.6, 99.5,105.8,112.2,119.0,126.0,    0,    0], // 10
  [ 83.4, 89.3, 95.2,101.3,107.9,114.6,121.5,129.0,    0,    0], // 11
  [ 85.0, 90.9, 97.0,103.4,110.0,117.0,    0,    0,    0,    0], // 12
];

// Standard temperatures for the pressure altitudes
// used to convert pressure altitude + temp to density alt
// most charts have -1000 as being the lowest possible pressure alt
// this one has -2000
//https://onlinelibrary.wiley.com/doi/pdf/10.1002/9781118534786.app1
const isa_table = [
   18.96, // degrees @ -2000
   16.98, // -1000
   15.0, // 0
   13.02, // 1000
   11.04,
   9.06,
   7.08,
   5.09,
   3.11,
   1.13,
   -0.85,
   -2.83, // 9,000
   -4.81,
   -6.79, // 11,000
   -8.77, // 12,000
   -10.76,
   -12.72, // 14,000
   
    
];
function get_isa_temp(pressure_altitude) {
  //starts at -2000 and goes to +14000
  //          0
  var index = pressure_altitude +2000; // 2000 becomes 4000
  index = Math.round(index / 1000); // 4000 becomes 4
  //console.log('get_isa_temp: ' + pressure_altitude + ', index: ' + index); 
  return isa_table[index];
}

function critical_alert(string) {
  critical_alert_log = critical_alert_log + "! - " + string + "<br>";
}

function get_density_altitude(pressure_altitude, temp) {
  //The formula is density altitude = pressure altitude + [120 x (OAT – ISA Temp)]
  if (pressure_altitude < min_pa) { 
    console.log('get_density_altitude: pressure altitude given is less than -2000; using -2000.');
    critical_alert('Failed to find Density Altitude because Pressure Altitude < -2000.');
    pressure_altitude = min_pa; 
  }
  if (pressure_altitude > max_pa) { 
    console.log('get_density_altitude: pressure altitude given is greater than 10000; using 10000.');
    critical_alert('Failed to find Density Altitude because Pressure Altitude > 10000.');
    pressure_altitude = max_pa;
  }
    
  var isa_temp = get_isa_temp(pressure_altitude);
  var da = pressure_altitude + (120 * (temp - isa_temp));    
  //console.log('get_density_altitude: ' + pressure_altitude + '/' + temp + ': ' + da);
  return da;
}

// given 1000=120 and 2000=220, what is 1500?
// refB must be greater than refB, refC must be between the two
function interpolate(refA, valA, refB, valB, refC) {
  if (refA == refB) {
    //console.log('interpolate: identical refA & refB, returning valA');
    return valA;
  }
  //console.log('interpolate: ' + refA + '@' + valA + ' w ' + refB + '@' + valB + ' c: ' + refC);
  var rel_diff = refB - refA;
  var val_diff = (valB - valA);
  var rel_diff_fraction = (refC - refA) / rel_diff;
  //console.log('  rel_diff: ' + rel_diff + ' val_diff: ' + val_diff + ' rel_diff_fraction: ' + rel_diff_fraction);
  //console.log('  out: ' + val_diff + rel_diff_fraction);
  return valA + (val_diff * rel_diff_fraction);
}
// used to find power available
// temp: must be on a 5 degree line
function get_temp_index(temp) {
  if (temp % 5 != 0) {
    //console.log('get_temp_index: temp not on a 5 degree line: ' + temp);
    critical_alert('Temperature found to not be divisable by 5.');
    return 0;
  }
  // -40 is 0
  var index = temp + 40;
  index = index / 5;
  //console.log('get_temp_index: temp: ' + temp + ' index: ' + index);
  return index;
}
// used to find power required
// can take any auw between 11000 and 15500
function get_auw_index(auw) {
  auw = Math.round(auw / 500) * 500; //Round to nearest 500
  var index = auw - min_auw;
  index = index / 500;
  //console.log('get_auw_index: auw: ' + auw + ' index: ' + index);
  return index;
}

// pressure_altitude: the pressure altitude on a thousand foot interval
// ie. 1000 is fine, 1021 is not
// returns: an array of power availables for that altitude
function get_pa_row(pressure_altitude) {
  var pa = Math.round(pressure_altitude / 1000);
  console.log('Pressure altitude rounded and divided: ' + pa);
  console.log('get_pa_row: power_available_table index: ' + (pa + power_available_row_zero_index));
  // -2000 has an index of 0 in the table
  // 1000' has an index of 2 in the table (???)
  return power_available_table[pa + power_available_row_zero_index];
}
// density_altitude: the density altitude on a thousand foot interval
// returns: an array of power required for that altitude
function get_pr_row(density_altitude,aa) {
  var da = Math.round(density_altitude / 1000);
  console.log('Density altitude: ' + density_altitude);
  //console.log('get_pr_row: power_required_table index: ' + (da+4));

  if (aa == false) {
    //console.log('pr row: ' + power_required_table[da + power_required_row_zero_index]);
    return power_required_table[da + power_required_row_zero_index];
  } else {
    //console.log('(AA) pr row: ' + power_required_table_aa[da + power_required_row_zero_index]);
    return power_required_table_aa[da + power_required_row_zero_index];
  }
}


//requires pressure_altitude on a thousand foot line
function lookup_power_available(pressure_altitude, temp) {
  if (pressure_altitude % 1000 != 0) {
    console.log('lookup_power_available: pressure_altitude not on a thousand foot line: ' + pressure_altitude);
    return 0;
  }
  console.log('pressure alt for lookup: ' + pressure_altitude);
  var row = get_pa_row(pressure_altitude);
  console.log('lookup_power_available row: ' + row);
  var temp_index = get_temp_index(temp);
  console.log('temp index: ' + temp);
  return row[temp_index];
}
//requires density_altitude on a thousand foot line
function lookup_power_required_reference(density_altitude, auw, aa) {
  if (density_altitude % 1000 != 0) {
    //console.log('lookup_power_required: density_altitude not on a thousand foot line: ' + density_altitude);
    return 0;
  }
  if (auw < min_auw || auw > max_auw) {
    console.log('lookup_power_required_reference: AUW out of range: ' + auw);
    critical_alert('Failed to find look up Power Required because AUW out of range: AUW: ' + auw);
    return 0;
  }
  var row = get_pr_row(density_altitude,aa);
  if (row == -1) {
    console.log('lookup_power_required_reference: bad row returned');
    critical_alert('Failed to find table row for Power Required: DA: ' + density_altitude + " AA: " + aa.toString() );
    return -1;
  }
  var auw_index = get_auw_index(auw);
  //console.log('pr: ' + row[auw_index]);
  return row[auw_index];
}


// temp: the actual temp between -40 and +40
// returns: all engine power available 
function get_power_available(pressure_altitude, temp) {
  var power_available = 0;
  if (temp < -40 || temp > 40 || temp % 5 != 0) {
    console.log('get_power_available: Bad Temp: ' + temp);
    critical_alert('Failed to get Power Available because Temp out of range (-40, +40, divisible by 5): temp: ' + temp);
    return 0;
  }
  if (pressure_altitude < min_pa || pressure_altitude > max_pa) {
    console.log('get_power_available: Bad Pressure Altitude ' + pressure_altitude); 
    critical_alert('Failed to get Power Available because Pressure Altitude out of range (-2000,+10000): Pressure Altitude: ' + pressure_altitude);
  }  
  if (pressure_altitude % 1000 != 0) {
    var lower_altitude = Math.floor(pressure_altitude / 1000) * 1000;
    var upper_altitude = Math.ceil(pressure_altitude / 1000) * 1000;
    var lower = lookup_power_available(lower_altitude, temp);
    var upper = lookup_power_available(upper_altitude, temp);
    power_available = interpolate(lower_altitude, lower, upper_altitude, upper, pressure_altitude);
  } else {
    power_available = lookup_power_available(pressure_altitude, temp);
  }
  //console.log('get_power_available: pressure alt: ' + pressure_altitude + ' temp: ' + temp);
  console.log('get_power_available: power_available: ' + power_available);
  return power_available;
}

// aa = anti-ice on bool
function get_power_required_reference(density_altitude, auw, aa) {
  var power_required = 0;
  if (density_altitude < min_da || density_altitude > max_da) {
    console.log('get_power_required: bad density altitude: ' + density_altitude);
    critical_alert('Failed to get Power Required reference number because of bad density altitude: ' + density_altitude);
    return 0;
  }

  // quad interpolation: 12,700 & 1021'
  // at the lower DA: 1000, interpolate to find lower_da_power (1000: 12,500/13,000: 12,700)
  // repeat for the upper DA: 13,000 (13,000: 1000-2000:1021)
  // then we have PR @ 12,500 & 13,000: 12,700

  console.log('get_power_required_reference: -------- starting interpolation -------');
  console.log('get_power_required reference: auw: ' + auw + ' da: ' + density_altitude);
  var lower_altitude = Math.floor(density_altitude / 1000) * 1000;
  var upper_altitude = Math.ceil(density_altitude / 1000) * 1000;

  if (auw % 500 != 0) {
    var lower_auw = Math.floor(auw / 500) * 500;
    var upper_auw = Math.ceil(auw / 500) * 500;
    // at the lower DA: 1000, interpolate to find lower_da_power (1000: 12,500/13,000: 12,700)
    var lower = lookup_power_required_reference(lower_altitude, lower_auw, aa);
    var upper = lookup_power_required_reference(lower_altitude, upper_auw, aa);
    var lower_da_power = interpolate(lower_auw, lower, upper_auw, upper, auw);
    //console.log('  quad interpolate: checking lower DA: ' + lower_altitude + ' pr: ' + lower_da_power);

    // repeat for the upper DA: 2000 (2000: 12,500/13,000: 12,700)
    lower = lookup_power_required_reference(upper_altitude, lower_auw, aa);
    upper = lookup_power_required_reference(upper_altitude, upper_auw, aa);
    var upper_da_power = interpolate(lower_auw, lower, upper_auw, upper, auw);
    //console.log('  quad interpolate: checking upper DA: ' + upper_altitude + ' pr: ' + upper_da_power);
    
    // then we havei PR @  12,500 & 13,000: 12,700
    power_required = interpolate(lower_altitude, lower_da_power, upper_altitude, upper_da_power, density_altitude);
  } else {
    //auw is on a 500kg line, we can just interpolate for DA
    var lower = lookup_power_required_reference(lower_altitude, auw, aa); 
    var upper = lookup_power_required_reference(upper_altitude, auw, aa);
    power_required = interpolate(lower_altitude, lower, upper_altitude, upper, density_altitude);
    //console.log('interpolation: l: ' + lower + ' u: ' + upper + ' pr: ' + power_required);
  }
  return power_required;

}

//power_required_reference must be on a 10% line
function lookup_wind_bonus(power_required_reference, wind, aa) {
  var power_index = (power_required_reference - 60) / 10;
  var wind_index = (wind -5) / 5; 
  //console.log('lookup_wind_bonus: power_index ' + power_index);
  var row;
  if (aa) { 
    // Anti-ice on, use anti-ice on table
    row = wind_bonus_table_aa[wind_index];  
  }
  else {
    row = wind_bonus_table[wind_index];
  }
  //console.log('lookup_wind_bonus wind_index: ' + wind_index + ' wind: ' + wind);
  return row[power_index];
}

//aa = Anti-ice on bool..
function apply_wind(power_required_reference, wind, aa) {
  if (wind == 0) { return power_required_reference; }
  var upper_power = Math.ceil(power_required_reference / 10) * 10; //93 becomes 9.3 -> 100
  var lower_power = Math.floor(power_required_reference / 10) * 10; // 90
  //get each wind bonus, above and below
  var upper_bonus = lookup_wind_bonus(lower_power, wind, aa);
  var lower_bonus = lookup_wind_bonus(upper_power, wind, aa); 
  var wind_bonus = interpolate(lower_power, lower_bonus, upper_power, upper_bonus, power_required_reference);
  console.log('apply_wind: bonus: ' + wind_bonus + ' (Anti-ice: ' + aa.toString() + ')');
  return power_required_reference - wind_bonus;

}

function get_pressure_altitude(alt_setting, true_altitude) {
  return Math.round(((29.92 - alt_setting) * 1000) + true_altitude);


}

function check_alt_setting(alt_setting) {
  if (alt_setting == '') { alt_setting = 29.92; }
  alt_setting = parseFloat(alt_setting);
  if (alt_setting == NaN) { 
    alt_setting = 29.92;
    critical_alert('Altimeter Setting given not a number. Using 29.92.');
  }
  //allow user to input format 2992
  if (alt_setting > 2650 && alt_setting < 3200) {
    alt_setting = alt_setting / 100;
    return alt_setting;
  }
  // Now we know it's not a valid alt setting in the thousands (2992)
  if (alt_setting < 26.50) {
    alt_setting = 29.92;
    critical_alert('Altimeter Setting given below 26.50. Using 29.92.');
  } 
  
  if (alt_setting > 32.00) {
    alt_setting = 29.92;
    critical_alert('Altimeter Setting given above 32.00. Using 29.92.');
  }  
  return alt_setting;
}

function check_true_alt(true_alt) {
  if (true_alt == '') { true_alt = 0; }
  true_alt = parseInt(true_alt);
  if (true_alt == NaN) { 
    true_alt = 0;
    critical_alert('True Altitude given not a number. Using 0.');
  }
  console.log(true_alt);
  return true_alt;
}

function check_load(load) {
  if (load == '') { load = 0; }
  load = parseInt(load);
  if (load == NaN) {
    load = 0;
    critical_alert('Load given not a number. Using 0.');
  }
  return load;
}  

//function on_altimeter_setting_input() {
//  var input = document.getElementById('altimeter_setting').value;
//  if (input.length > 3) { calc_power_available(); }
//}
// Called whenever there's a change to pressure altitude or temp,
// calls calc_power_required() as well
function calc_power_available() {
  console.log('*******************CALC_POWER_AVAILABLE start *******************');
  fail_pa("");
  var alt_setting = document.getElementById('altimeter_setting').value;
  alt_setting = check_alt_setting(alt_setting);
  console.log(alt_setting);
  document.getElementById('altimeter_setting').value = alt_setting;
  
  var true_altitude = document.getElementById('true_altitude').value;
  true_altitude = check_true_alt(true_altitude);
  document.getElementById('true_altitude').value = true_altitude;
  console.log("true_altitude now: " + document.getElementById('true_altitude').value);

  pressure_altitude = get_pressure_altitude(alt_setting, true_altitude);
  console.log('min PA: ' + min_pa);
  console.log('pressure alt: ' + pressure_altitude);
  if (pressure_altitude < min_pa || pressure_altitude > max_pa) {
    document.getElementById('pressure_altitude_alert').innerHTML = "[Out of Range: Min " + min_pa + " Max " + max_pa + "]";
    fail_pa("Pressure Altitude out of range.");
    fail_pr("Pressure Altitude out of range.");
    return;
  }
  else {
    document.getElementById('pressure_altitude_alert').innerHTML = "";
  }
  
  var temp = parseInt(document.getElementById('temperature').value);
  var power_available = get_power_available(pressure_altitude, temp);
  var power_available_aa = power_available - 8;
  console.log('calc_power_available done. writing out ' + power_available);
  document.getElementById('pressure_altitude').innerHTML = pressure_altitude;
  console.log(pressure_altitude);
  document.getElementById('temperature_display').innerHTML = temp;
  document.getElementById('pa_aa_off').innerHTML = Math.round(power_available) + ' / ' + Math.round(power_available / 3 * 2);
  document.getElementById('pa_aa_on').innerHTML = Math.round(power_available_aa) + ' / ' + Math.round(power_available_aa / 3 * 2);

  calc_power_required();
}


// called whenever there's a change to the aircraft state
// calls calc_power_required too
function calc_auw(slider) {
  var fuel = parseInt(document.getElementById('fuel').value);
  //was this function called from the slider?
  if (slider == true) {
    fuel = parseInt(document.getElementById('fuel').value);
    document.getElementById('fuel_display').innerHTML = fuel;
  } 
  var aircraft = parseInt(document.getElementById('aircraft').value);
  var load = document.getElementById('load').value;
  load = check_load(load);
  document.getElementById('load').value = load;
  
  
  var auw = aircraft + load + fuel;
    document.getElementById('auw_alert').innerHTML = "";
  if (auw < min_auw) {
    document.getElementById('auw_alert').innerHTML = 'Min AUW for calculator: ' + min_auw;
  }
  if (auw > max_auw) {
    document.getElementById('auw_alert').innerHTML = 'Max AUW for calculator: ' + max_auw;
  }    
  document.getElementById('auw').innerHTML = auw;
  document.getElementById('aircraft_weight').innerHTML = aircraft;
  calc_power_required();
}

// Called by calc_auwi,calc_wind or calc_power_available or if there's a change of wind
function calc_power_required(auw_invalid) {
  critical_alert_log = "";
  fail_pr(""); //reset failed PR alert

  console.log('*******************CALC_POWER_REQUIRED start *******************');
  var pressure_altitude = parseInt(document.getElementById('pressure_altitude').innerHTML); 
  var temperature = parseInt(document.getElementById('temperature').value);
  
  var auw = parseInt(document.getElementById('auw').innerHTML);
  
  if (auw < min_auw || auw > max_auw) {
    fail_pr("AUW out of Range.");
    return;
  }

  var density_altitude = get_density_altitude(pressure_altitude, temperature);
  if (density_altitude > max_da || density_altitude < min_da) {
    console.log("calc_power_required: density_altitude found to be out of range: " + density_altitude);
    fail_pr("Density Altitude " + Math.round(density_altitude) + " off the chart (" + min_da + " to " + max_da + ")");
    return;
  }


  var power_required_reference = get_power_required_reference(density_altitude, auw, false);
  var power_required_reference_aa = get_power_required_reference(density_altitude, auw, true);
  
  var wind = parseInt(document.getElementById('wind').value);
  var power_required = apply_wind(power_required_reference, wind, false);
  var power_required_aa = apply_wind(power_required_reference_aa, wind, true);
  
  document.getElementById('pr').innerHTML = Math.round(power_required);
  document.getElementById('pr_aa').innerHTML = Math.round(power_required_aa);
  document.getElementById('critical_alert').innerHTML = critical_alert_log;
}

function fail_pr(reason) {
  document.getElementById('pr_fail').innerHTML = reason;
  document.getElementById('pr').innerHTML = ""
  document.getElementById('pr_aa').innerHTML = ""
}
function fail_pa(reason) {
  document.getElementById('pa_fail').innerHTML = reason;
  document.getElementById('pa_aa_off').innerHTML = ""
  document.getElementById('pa_aa_on').innerHTML = ""
}

// wind slider moved
function calc_wind() {
  document.getElementById('wind_display').innerHTML = document.getElementById('wind').value;
  calc_power_required();
}


function init() {
  document.getElementById('wind_display').innerHTML = document.getElementById('wind').value;
  calc_auw(true);
  calc_power_available();
  //calc_power_required() called twice by the functions above.
}
