// matri_frontend/Matri/scripts/testDropdowns.js
const { dropdowns } = require('../services/dropdowns');

(async () => {
  try {
    console.log('Religions:', await dropdowns.religions());
    console.log('Castes (religion 1):', await dropdowns.castes(1));
    console.log('Genders:', await dropdowns.genders());
    console.log('Smoking:', await dropdowns.smoking());
    console.log('Drinking:', await dropdowns.drinking());
    console.log('Marital Status:', await dropdowns.maritalStatus());
    console.log('Blood Groups:', await dropdowns.bloodGroups());
    console.log('Countries:', await dropdowns.countries());
    console.log('States (country 1):', await dropdowns.states(1));
    console.log('Cities (state 1):', await dropdowns.cities(1));
    console.log('Heights:', await dropdowns.heights());
    console.log('Weights:', await dropdowns.weights());
  } catch (e) {
    console.error('Error fetching dropdowns', e);
  } finally {
    process.exit(0);
  }
})();