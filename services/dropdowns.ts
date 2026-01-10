import { apiService } from './api';

export const dropdowns = {
  religions: async () => {
    try {
      const r = await apiService.api.get('/dropdowns/religions');
      return r.data?.data || r.data;
    } catch {
      // fallback legacy endpoint
      const res = await apiService.api.get('/options');
      return res.data?.religions || res.data?.data?.religions || [];
    }
  },
  castes: async (religionId: number) => {
    try {
      const r = await apiService.api.get(`/dropdowns/castes?religion_id=${religionId}`);
      return Array.isArray(r.data?.data)
        ? r.data.data
        : r.data?.data || r.data;
    } catch {
      // fallback: options endpoint may contain castes keyed by religion
      const res = await apiService.api.get('/options');
      const byRel = res.data?.castes_by_religion || {};
      if(byRel[religionId]) return byRel[religionId];
      // fallback flat castes array with religion key
      const flat = res.data?.castes || res.data?.data?.castes || [];
      return flat.filter((c:any)=> String(c.religion_id??c.religionId??c.rel_id) === String(religionId));
    }
  },
  genders: () => Promise.resolve(['Male','Female','Other']), // fallback static
  smoking: () => apiService.api.get('/dropdowns/smoking').then(r=>r.data?.data||r.data),
  drinking: () => apiService.api.get('/dropdowns/drinking').then(r=>r.data?.data||r.data),
  maritalStatus: () => apiService.api.get('/dropdowns/marital-status').then(r=>r.data?.data||r.data),
  bloodGroups: () => apiService.api.get('/dropdowns/blood-groups').then(r=>r.data?.data||r.data),
  countries: () => apiService.api.get('/dropdowns/countries').then(r=>r.data?.data||r.data),
  states: (countryId:number) => apiService.api.get(`/dropdowns/states?country_id=${countryId}`).then(r=>r.data?.data||r.data),
  cities: (stateId:number) => apiService.api.get(`/dropdowns/cities?state_id=${stateId}`).then(r=>r.data?.data||r.data),
  heights: () => apiService.api.get('/dropdowns/height').then(r=>r.data?.data||r.data),
  weights: () => apiService.api.get('/dropdowns/weight').then(r=>r.data?.data||r.data)
};
