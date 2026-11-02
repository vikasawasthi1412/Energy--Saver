/* Energy Advisor sample data.
   Alerts are taken from sic_IoT_test_dataset_251231.csv (sample rows).
   To use your own data, replace the `alerts` array; keep the same field names. */
window.EA_DATA = {
  rules: {
    1: {
      key: "peak",
      name: "Appliance Peak Shift",
      short: "Peak shift",
      condition: "dishwasher = on AND tariff = Peak",
      logic: "Alerts when the dishwasher runs during peak-tariff hours.",
      accept: "Schedule for 06:00",
      accepted: "Rescheduled to 06:00 tomorrow"
    },
    2: {
      key: "night",
      name: "Night Heating Reduction",
      short: "Night heating",
      condition: "00:00–05:00 AND hvac = heat AND outdoor > 10 °C",
      logic: "Suggests a lower heating setpoint at night when it is mild outside.",
      accept: "Lower heat by 1 °C",
      accepted: "Heating setpoint lowered by 1 °C"
    },
    3: {
      key: "cool",
      name: "Mild-Weather Free Cooling",
      short: "Free cooling",
      condition: "hvac = cool AND outdoor ≤ indoor",
      logic: "Suggests opening windows when outside air is cooler than inside.",
      accept: "Pause AC, open windows",
      accepted: "AC paused for free cooling"
    }
  },
  alerts: [
    { id: "A01", timestamp: "2026-08-02 20:00", tariff_period: "Peak", hvac_mode: "cool", outdoor_temp_c: 28.4, indoor_temp_c: 22.1, cool_setpoint: 22.0, heat_setpoint: 20.0, usage_kwh: 4.00, rule: 1,
      alert_message: "It's a peak time right now. Shall I schedule the cycle of the appliance for tomorrow morning?",
      energy_tip: "You're using the dishwasher during the most expensive part of the day. To maximize efficiency, schedule your appliance cycles for the off-peak hours." },
    { id: "A02", timestamp: "2026-07-19 17:00", tariff_period: "Peak", hvac_mode: "cool", outdoor_temp_c: 30.2, indoor_temp_c: 22.3, cool_setpoint: 22.0, heat_setpoint: 20.0, usage_kwh: 3.92, rule: 1,
      alert_message: "It's a peak time right now. Shall I schedule the cycle of the appliance for tomorrow morning?",
      energy_tip: "High energy demand right now means higher prices for your appliances. Try to hold off on starting the next load until the sun goes down to optimize your budget." },
    { id: "A03", timestamp: "2026-07-09 22:00", tariff_period: "Peak", hvac_mode: "cool", outdoor_temp_c: 24.8, indoor_temp_c: 26.5, cool_setpoint: 24.0, heat_setpoint: 20.0, usage_kwh: 1.79, rule: 3,
      alert_message: "It's cooler outside than indoors — consider opening your windows to save energy.",
      energy_tip: "Nature is providing free cooling tonight with lower outdoor temperatures. Give your air conditioner a break and let the fresh night air lower your indoor temperature." },
    { id: "A04", timestamp: "2025-06-26 18:00", tariff_period: "Peak", hvac_mode: "cool", outdoor_temp_c: 25.6, indoor_temp_c: 27.8, cool_setpoint: 24.0, heat_setpoint: 20.0, usage_kwh: 3.16, rule: 3,
      alert_message: "It's cooler outside than indoors — consider opening your windows to save energy.",
      energy_tip: "The evening breeze is actually cooler than your living room, so feel free to turn off the AC. Simply opening a few windows will refresh your home naturally." },
    { id: "A05", timestamp: "2026-04-26 19:00", tariff_period: "Peak", hvac_mode: "off", outdoor_temp_c: 21.5, indoor_temp_c: 18.0, cool_setpoint: 25.0, heat_setpoint: 20.0, usage_kwh: 1.36, rule: 1,
      alert_message: "It's a peak time right now. Shall I schedule the cycle of the appliance for tomorrow morning?",
      energy_tip: "Your dishwasher is running during a high-tariff period. Switching this chore to an off-peak window will help you save on every wash." },
    { id: "A06", timestamp: "2026-03-24 21:00", tariff_period: "Peak", hvac_mode: "heat", outdoor_temp_c: 16.8, indoor_temp_c: 21.7, cool_setpoint: 25.0, heat_setpoint: 21.0, usage_kwh: 2.70, rule: 1,
      alert_message: "It's a peak time right now. Shall I schedule the cycle of the appliance for tomorrow morning?",
      energy_tip: "Electricity rates are at their highest tonight, so why not wait to run the dishwasher? Setting a delay timer for the early morning is an effortless way to cut costs." },
    { id: "A07", timestamp: "2026-03-21 01:00", tariff_period: "Off-Peak", hvac_mode: "heat", outdoor_temp_c: 11.2, indoor_temp_c: 21.7, cool_setpoint: 25.0, heat_setpoint: 21.0, usage_kwh: 2.51, rule: 2,
      alert_message: "To save energy, shall I adjust your heating setpoint?",
      energy_tip: "The mild air outside means your heater doesn't need to work so hard right now. Consider lowering your setpoint to keep the house cozy without overspending." },
    { id: "A08", timestamp: "2026-02-16 20:00", tariff_period: "Peak", hvac_mode: "heat", outdoor_temp_c: 3.0, indoor_temp_c: 22.3, cool_setpoint: 25.0, heat_setpoint: 22.0, usage_kwh: 3.87, rule: 1,
      alert_message: "It's a peak time right now. Shall I schedule the cycle of the appliance for tomorrow morning?",
      energy_tip: "Since it's currently peak hours, try delaying your dishwasher cycle until after midnight. You'll enjoy clean dishes while lowering your electricity bill." }
  ]
};
