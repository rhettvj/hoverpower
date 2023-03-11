// Wind bonus is power_required_reference vs headwind
const wind_bonus_table = [
    //5     60   70    80    90    100    110  120  130
    [1.0, 1.0,  0.5,  0.4,  0.4,   0.0,  0.0,  0.0], //5 kts
    [1.6, 2.0,  2.0,  2.0,  1.1,   0.8,  0.2,  0.4],
    [4.0, 4.9,  4.9,  4.3,  2.6,   2.0,  1.1,  1.8], // 15 kts
    [6.5, 8.9,  8.6,  6.9,  5.0,   4.6,  4.5,  5.0],
    [9.0, 12.0, 13.5, 12.0, 10.5,  9.5,  9.5, 10.5],  //25
    [10.0,10.0, 18.0, 19.0, 18.0, 19.0, 19.6, 21.5],  //30
];

const power_available_table = [
  // Each row is a PRESSURE altitude,
  // each column is a temp, starting at -40, stepping 5 degrees
  //  -35      -25    -15     -5   0   5       15      25      35 
  [138,137,136,135,135,135,135,134,133,132,131,129,126,121,117,111,106], // -1000
  [138,137,136,135,135,135,134,134,133,132,131,126,122,116,112,106,101], // 0
  [136,136,135,135,134,134,133,132,130,128,125,122,117,112,107,102,097],
  [135,135,135,134,134,133,132,130,126,123,120,116,112,107,102,097,092], // 2000
  [132,132,132,131,129,127,126,124,121,118,115,111,107,102,097,092,087],
  [130,130,130,127,125,123,120,118,116,113,110,106,102,097,093,088,083],
  [125,125,124,123,120,118,116,113,111,108,106,102,098,093,088,084,080],
  [122,120,119,117,115,113,111,108,106,104,101,097,093,088,085,080,076],
  [117,115,114,112,110,108,107,104,102,098,097,093,089,085,082,-01,-01]
];


const power_required_table = [
  // Each row is a DENSITY altitude,
  // each column is an AUW, starting at 11,000, ending at 15500
  //11   5     12    5     13    5     14    5     15    5  <- AUW
  [ 76.0, 71.0, 75.1, 79.2, 83.5, 88.0, 92.2, 96.9,101.5,106.1], //-7000
  [ 66.3, 70.5, 74.5, 78.8, 82.9, 87.0, 91.3, 95.9,103.5,105.0],
  [ 65.8, 69.9, 73.9, 77.9, 82.0, 86.1, 90.3, 94.9, 99.2,103.9],
  [ 67.6, 71.7, 75.9, 80.1, 84.5, 88.9, 93.2, 98.0,102.5,107.4], // -4000
  [ 68.2, 72.5, 76.5, 81.0, 85.1, 89.8, 94.2, 99.0,103.9,109.0], // -3
  [ 69.0, 73.1, 77.4, 81.7, 86.1, 90.8, 95.4,100.2,105.1,110.5], // -2
  [ 69.7, 73.9, 78.1, 82.5, 87.1, 91.7, 96.5,101.4,106.8,112.1], // -1000
  [ 70.2, 74.8, 79.0, 83.2, 88.0, 92.7, 97.8,103.0,108.3,114.0], // 0'
  [ 71.1, 75.2, 79.9, 84.2, 89.1, 94.0, 99.1,104.6,110.2,116.0], // 1
  [ 71.8, 76.1, 80.8, 85.4, 90.2, 95.3,100.7,106.3,112.2,118.1],  // 2
  [ 72.5, 77.0, 81.6, 86.4, 91.5, 95.8,102.4,108.2,114.1,120.0], //3
  [ 73.2, 77.9, 82.8, 87.6, 92.9, 98.4,104.2,110.1,116.0,122.1], // 4000
  [ 74.1, 78.9, 83.8, 88.9, 94.3,100.0,106.0,112.0,118.1,124.4], // 5
  [ 75.0, 79.9, 85.0, 90.3, 96.0,102.0,107.9,114.0,120.3,127.0], // 6
  [ 76.0, 81.0, 86.3, 92.0, 97.8,103.7,109.8,116.2,122.8,129.5], // 7000
];

// Standard temperatures for the pressure altitudes
// used to convert pressure altitude + temp to density alt
// most charts have -1000 as being the lowest possible pressure alt
// this one has -2000
const isa_table = [
   18.96, // -2000
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
   -2.83, // 10,000
   -4.81 
];
function get_isa_temp(pressure_altitude) {
  //starts at -2000 and goes to +10000
  //          0
  var index = pressure_altitude +2000; // 2000 becomes 4000
  index = Math.round(index / 1000); // 4000 becomes 4
  console.log('get_isa_temp: ' + pressure_altitude + ', index: ' + index); 
  return isa_table[index];
}

function get_density_altitude(pressure_altitude, temp) {
  //The formula is density altitude = pressure altitude + [120 x (OAT – ISA Temp)]
  if (pressure_altitude < -2000) { pressure_altitude = 2000; }
  if (pressure_altitude > 10000) { pressure_altitude = 10000; }
    
  var isa_temp = get_isa_temp(pressure_altitude);
  var da = pressure_altitude + (120 * (temp - isa_temp));    
  console.log('get_density_altitude: ' + pressure_altitude + '/' + temp + ': ' + da);
  return da;
}

// given 1000=120 and 2000=220, what is 1500?
// refB must be greater than refB, refC must be between the two
function interpolate(refA, valA, refB, valB, refC) {
  if (refA == refB) {
    console.log('interpolate: identical refA & refB, returning valA');
    return valA;
  }
  console.log('interpolate: ' + refA + '@' + valA + ' w ' + refB + '@' + valB + ' c: ' + refC);
  var rel_diff = refB - refA;
  var val_diff = (valB - valA);
  var rel_diff_fraction = (refC - refA) / rel_diff;
  console.log('  rel_diff: ' + rel_diff + ' val_diff: ' + val_diff + ' rel_diff_fraction: ' + rel_diff_fraction);
  console.log('  out: ' + val_diff + rel_diff_fraction);
  return valA + (val_diff * rel_diff_fraction);
}
// used to find power available
// temp: must be on a 5 degree line
function get_temp_index(temp) {
  if (temp % 5 != 0) {
    console.log('get_temp_index: temp not on a 5 degree line: ' + temp);
    return 0;
  }
  // -40 is 0
  var index = temp + 40;
  index = index / 5;
  console.log('get_temp_index: temp: ' + temp + ' index: ' + index);
  return index;
}
// used to find power required
// can take any auw between 11000 and 15500
function get_auw_index(auw) {
  auw = Math.round(auw / 500) * 500; //Round to nearest 500
  var index = auw - 11000;
  index = index / 500;
  console.log('get_auw_index: auw: ' + auw + ' index: ' + index);
  return index;
}

// pressure_altitude: the pressure altitude on a thousand foot interval
// ie. 1000 is fine, 1021 is not
// returns: an array of power availables for that altitude
function get_pa_row(pressure_altitude) {
  var pa = Math.round(pressure_altitude / 1000);
  console.log('Pressure altitude rounded and divided: ' + pa);
  console.log('get_pa_row: power_available_table index: ' + (pa + 1));
  // -1000 has an index of 0 in the table
  // 1000' has an index of 2 in the table
  return power_available_table[pa + 1];
}
// density_altitude: the density altitude on a thousand foot interval
// returns: an array of power required for that altitude
function get_pr_row(density_altitude) {
  var da = Math.round(density_altitude / 1000);
  console.log('Density altitude ' + density_altitude + ' rounded and divided: ' + da);
  console.log('get_pr_row: power_required_table index: ' + (da+4));
  console.log('pr row: ' + power_required_table[da + 4]);
  // -4000 has an index of 0 in the table
  // 1000' has an index of 3 in the table
  return power_required_table[da + 4];
}


//requires pressure_altitude on a thousand foot line
function lookup_power_available(pressure_altitude, temp) {
  if (pressure_altitude % 1000 != 0) {
    console.log('lookup_power_available: pressure_altitude not on a thousand foot line: ' + pressure_altitude);
    return 0;
  }
  var row = get_pa_row(pressure_altitude);
  var temp_index = get_temp_index(temp);
  return row[temp_index];
}
//requires density_altitude on a thousand foot line
function lookup_power_required_reference(density_altitude, auw) {
  if (density_altitude % 1000 != 0) {
    console.log('lookup_power_required: density_altitude not on a thousand foot line: ' + density_altitude);
    return 0;
  }
  if (auw < 11000 || auw > 15500) {
    console.log('lookup_power_required: auw out of range: ' + auw);
    return 0;
  }
  var row = get_pr_row(density_altitude);
  if (row == -1) {
    return -1;
  }
  var auw_index = get_auw_index(auw);
  console.log('pr: ' + row[auw_index]);
  return row[auw_index];
}


// temp: the actual temp between -40 and +40
// returns: all engine power available 
function get_power_available(pressure_altitude, temp) {
  var power_available = 0;
  if (temp < -40 || temp > 40 || temp % 5 != 0) {
    console.log('get_power_available: bad temp: ' + temp);
    return 0;
  }
  if (pressure_altitude < -1000 || pressure_altitude > 10000) {
    console.log('get_power_available: bad pressure altitude: ' + pressure_altitude);
    return 0;
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
  console.log('get_power_available: pressure alt: ' + pressure_altitude + ' temp: ' + temp);
  console.log('get_power_available: power_available: ' + power_available);
  return power_available;
}

function get_power_required_reference(density_altitude, auw) {
  var power_required = 0;
  if (density_altitude < -10000 || density_altitude > 10000) {
    console.log('get_power_required: bad density altitude: ' + density_altitude);
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
    var lower = lookup_power_required_reference(lower_altitude, lower_auw);
    var upper = lookup_power_required_reference(lower_altitude, upper_auw);
    var lower_da_power = interpolate(lower_auw, lower, upper_auw, upper, auw);
    console.log('  quad interpolate: checking lower DA: ' + lower_altitude + ' pr: ' + lower_da_power);

    // repeat for the upper DA: 2000 (2000: 12,500/13,000: 12,700)
    lower = lookup_power_required_reference(upper_altitude, lower_auw);
    upper = lookup_power_required_reference(upper_altitude, upper_auw);
    var upper_da_power = interpolate(lower_auw, lower, upper_auw, upper, auw);
    console.log('  quad interpolate: checking upper DA: ' + upper_altitude + ' pr: ' + upper_da_power);
    
    // then we havei PR @  12,500 & 13,000: 12,700
    power_required = interpolate(lower_altitude, lower_da_power, upper_altitude, upper_da_power, density_altitude);
  } else {
    //auw is on a 500kg line, we can just interpolate for DA
    var lower = lookup_power_required_reference(lower_altitude, auw); 
    var upper = lookup_power_required_reference(upper_altitude, auw);
    power_required = interpolate(lower_altitude, lower, upper_altitude, upper, density_altitude);
    console.log('interpolation: l: ' + lower + ' u: ' + upper + ' pr: ' + power_required);
  }
  return power_required;

}

//power_required_reference must be on a 10% line
function lookup_wind_bonus(power_required_reference, wind) {
  var power_index = (power_required_reference - 60) / 10;
  var wind_index = (wind -5) / 5; 
  console.log('lookup_wind_bonus: power_index ' + power_index);
  var row = wind_bonus_table[wind_index];
  console.log('lookup_wind_bonus wind_index: ' + wind_index + ' wind: ' + wind);
  return row[power_index];
}

function apply_wind(power_required_reference, wind) {
  if (wind == 0) { return power_required_reference; }
  var upper_power = Math.ceil(power_required_reference / 10) * 10; //93 becomes 9.3 -> 100
  var lower_power = Math.floor(power_required_reference / 10) * 10; // 90
  //get each wind bonus, above and below
  var upper_bonus = lookup_wind_bonus(lower_power, wind);
  var lower_bonus = lookup_wind_bonus(upper_power, wind); 
  var wind_bonus = interpolate(lower_power, lower_bonus, upper_power, upper_bonus, power_required_reference);
  console.log('apply_wind: bonus: ' + wind_bonus);
  return power_required_reference - wind_bonus;

}

// Called whenever there's a change to pressure altitude or temp,
// calls calc_power_required() as well
function calc_power_available() {
  console.log('*******************CALC_POWER_AVAILABLE start *******************');
  var pressure_altitude = parseInt(document.getElementById('pressure_altitude').value);
  var temp = parseInt(document.getElementById('temperature').value);
  var power_available = get_power_available(pressure_altitude, temp);
  power_available = Math.round(power_available); //rounding here only because javascript was doing funky stuff with the -8 line below
  var power_available_aa = power_available - 8;
  console.log('calc_power_available done. writing out ' + power_available);
  document.getElementById('temperature_display').innerHTML = temp;
  document.getElementById('pa_aa_off').innerHTML = power_available + ' / ' + Math.round(power_available / 3 * 2);
  document.getElementById('pa_aa_on').innerHTML = power_available_aa + ' / ' + Math.round(power_available_aa / 3 * 2);

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
  var load = parseInt(document.getElementById('load').value);
  
  var auw = aircraft + load + fuel;
  document.getElementById('auw').innerHTML = auw;
  document.getElementById('aircraft_weight').innerHTML = aircraft;
  calc_power_required();
}

// Called by calc_auwi,calc_wind or calc_power_available or if there's a change of wind
function calc_power_required(auw_invalid) {
  console.log('*******************CALC_POWER_REQUIRED start *******************');
  var pressure_altitude = parseInt(document.getElementById('pressure_altitude').value); 
  var temperature = parseInt(document.getElementById('temperature').value);
  var density_altitude = get_density_altitude(pressure_altitude, temperature);
  var auw = parseInt(document.getElementById('auw').innerHTML);
  
  if (auw < 11000 || auw > 15500) {
    document.getElementById('pr').innerHTML = 'Bad AUW';
    return;
  }
  var power_required_reference = get_power_required_reference(density_altitude, auw);
  var wind = parseInt(document.getElementById('wind').value);
  var power_required = apply_wind(power_required_reference, wind);
  document.getElementById('pr').innerHTML = Math.round(power_required);
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
