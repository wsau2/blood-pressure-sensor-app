import * as spectra from "ml-spectra-processing"
// import * as scijs from "scijs"
 
function getBloodPressure(adcArray) {
    console.log("GBP has received", adcArray);

    const dt = 0.01; // time step in seconds
    const derivative = [];

    for (let i = 1; i < adcArray.length; i++) {
        const dy = adcArray[i] - adcArray[i - 1];
        derivative.push(dy / dt);
    }

    console.log("Derivative:", derivative);


    // spectra.

    return derivative;
}

export default getBloodPressure;
