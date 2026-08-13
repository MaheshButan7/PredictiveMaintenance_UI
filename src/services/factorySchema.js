// Factory Architecture & Sensor Metadata Schema

export const FACTORY_UNITS = [
  {
    id: "U1",
    name: "Unit 1: Machining & Fabrication",
    code: "U1-FAB",
    location: "Bay A - West Wing",
    machines: [
      {
        id: "M-101",
        name: "CNC Milling Center",
        type: "CNC Mill",
        model: "PrecisionMill X5",
        acousticBaseline: "Baseline 2.4 kHz harmonics nominal",
        acousticDiagnostics: {
          ok: "Harmonic spectrum stable. Spindle acoustic baseline nominal.",
          warn: "Elevated high-frequency vibration (3.2 kHz). Micro-chatter detected on Spindle #1.",
          crit: "Severe bearing race degradation detected. High amplitude harmonic spikes."
        },
        sensors: [
          {
            id: "spindle_temp",
            name: "Spindle Temperature",
            shortName: "Spindle Temp",
            unit: "°C",
            min: 20,
            max: 120,
            norm: 42.5,
            warnHigh: 75.0,
            critHigh: 92.0,
            precision: 1
          },
          {
            id: "axis_vib",
            name: "Axis Vibration",
            shortName: "Axis Vib",
            unit: "mm/s",
            min: 0,
            max: 15,
            norm: 1.8,
            warnHigh: 6.5,
            critHigh: 10.5,
            precision: 2
          },
          {
            id: "coolant_press",
            name: "Coolant Flow Pressure",
            shortName: "Coolant Press",
            unit: "PSI",
            min: 0,
            max: 100,
            norm: 62.0,
            warnLow: 35.0,
            critLow: 20.0,
            precision: 1
          }
        ]
      },
      {
        id: "M-102",
        name: "Hydraulic Stamping Press",
        type: "Hydraulic Press",
        model: "Stampex Titan 400T",
        acousticBaseline: "Pulse frequency 1.2 Hz normal cavitation-free",
        acousticDiagnostics: {
          ok: "Hydraulic valve acoustic signature normal.",
          warn: "Acoustic hiss in main relief valve line. Minor cavitation suspect.",
          crit: "High fluid turbulence & shockwave acoustics. Severe valve seal erosion."
        },
        sensors: [
          {
            id: "sys_press",
            name: "System Hydraulic Pressure",
            shortName: "System Press",
            unit: "Bar",
            min: 0,
            max: 350,
            norm: 215.0,
            warnHigh: 285.0,
            critHigh: 325.0,
            precision: 0
          },
          {
            id: "oil_temp",
            name: "Hydraulic Oil Temp",
            shortName: "Oil Temp",
            unit: "°C",
            min: 10,
            max: 100,
            norm: 44.0,
            warnHigh: 66.0,
            critHigh: 82.0,
            precision: 1
          },
          {
            id: "ram_align",
            name: "Ram Alignment Offset",
            shortName: "Ram Offset",
            unit: "µm",
            min: 0,
            max: 60,
            norm: 3.5,
            warnHigh: 22.0,
            critHigh: 40.0,
            precision: 1
          }
        ]
      }
    ]
  },
  {
    id: "U2",
    name: "Unit 2: Utilities & Power Generation",
    code: "U2-PWR",
    location: "Central Utility Plant",
    machines: [
      {
        id: "M-201",
        name: "Industrial Diesel Generator",
        type: "Diesel Generator",
        model: "PowerGen V16-2000",
        acousticBaseline: "Combustion acoustic rhythm 1500 RPM nominal",
        acousticDiagnostics: {
          ok: "Combustion acoustics uniform across all 16 cylinders.",
          warn: "Acoustic misfire signature on Cylinder #4 exhaust manifold.",
          crit: "Heavy metallic knocking detected. Rod bearing mechanical clearance breach."
        },
        sensors: [
          {
            id: "lube_press",
            name: "Lube Oil Pressure",
            shortName: "Lube Press",
            unit: "PSI",
            min: 0,
            max: 80,
            norm: 54.0,
            warnLow: 36.0,
            critLow: 25.0,
            precision: 1
          },
          {
            id: "exhaust_temp",
            name: "Exhaust Gas Temp",
            shortName: "Exhaust Temp",
            unit: "°C",
            min: 100,
            max: 700,
            norm: 385.0,
            warnHigh: 530.0,
            critHigh: 620.0,
            precision: 0
          },
          {
            id: "rpm_var",
            name: "Governor RPM Variance",
            shortName: "RPM Var",
            unit: "RPM",
            min: 0,
            max: 150,
            norm: 6.0,
            warnHigh: 45.0,
            critHigh: 85.0,
            precision: 1
          }
        ]
      },
      {
        id: "M-202",
        name: "Rotary Screw Air Compressor",
        type: "Air Compressor",
        model: "AirStream Max 90",
        acousticBaseline: "Continuous rotor meshing acoustic profile",
        acousticDiagnostics: {
          ok: "Twin screw mesh harmonics balanced.",
          warn: "High frequency rotor friction whistle. Oil film breakdown suspected.",
          crit: "Rotor contact clatter. Immediate interlock required to prevent seize."
        },
        sensors: [
          {
            id: "disch_press",
            name: "Discharge Pressure",
            shortName: "Disch Press",
            unit: "PSI",
            min: 0,
            max: 175,
            norm: 116.0,
            warnHigh: 142.0,
            critHigh: 162.0,
            precision: 1
          },
          {
            id: "intercooler_temp",
            name: "Intercooler Temp",
            shortName: "Intercooler T",
            unit: "°C",
            min: 20,
            max: 130,
            norm: 48.0,
            warnHigh: 85.0,
            critHigh: 106.0,
            precision: 1
          },
          {
            id: "oil_moisture",
            name: "Oil Moisture Content",
            shortName: "Oil Moisture",
            unit: "PPM",
            min: 0,
            max: 200,
            norm: 22.0,
            warnHigh: 95.0,
            critHigh: 145.0,
            precision: 0
          }
        ]
      }
    ]
  },
  {
    id: "U3",
    name: "Unit 3: Fluid Handling & Heavy Pumping",
    code: "U3-FLD",
    location: "Process Bay B",
    machines: [
      {
        id: "M-301",
        name: "High-Capacity Centrifugal Pump",
        type: "Centrifugal Pump",
        model: "HydroFlow 8000",
        acousticBaseline: "Smooth hydrodynamic flow signature",
        acousticDiagnostics: {
          ok: "Hydraulic flow acoustic signature calm.",
          warn: "Micro-cavitation crackle detected at suction impeller eye.",
          crit: "Severe cavitation implosion acoustic shocks. Impeller pitting imminent."
        },
        sensors: [
          {
            id: "suction_press",
            name: "Suction Pressure",
            shortName: "Suction Press",
            unit: "Bar",
            min: 0,
            max: 16,
            norm: 5.4,
            warnLow: 2.6,
            critLow: 1.4,
            precision: 2
          },
          {
            id: "impeller_vib",
            name: "Impeller Vibration",
            shortName: "Impeller Vib",
            unit: "g",
            min: 0,
            max: 5,
            norm: 0.65,
            warnHigh: 2.2,
            critHigh: 3.7,
            precision: 2
          },
          {
            id: "seal_temp",
            name: "Mechanical Seal Temp",
            shortName: "Seal Temp",
            unit: "°C",
            min: 20,
            max: 140,
            norm: 46.0,
            warnHigh: 84.0,
            critHigh: 112.0,
            precision: 1
          }
        ]
      },
      {
        id: "M-302",
        name: "Centrifugal HVAC Chiller",
        type: "HVAC Chiller",
        model: "CoolTech CentriChill 500",
        acousticBaseline: "Low 60Hz motor hum & refrigerant surge balance",
        acousticDiagnostics: {
          ok: "Compressor motor hum & gas velocity acoustic nominal.",
          warn: "Refrigerant liquid surge acoustic gurgle in suction bypass.",
          crit: "Liquid slugging acoustic impact spikes. Risk of compressor impeller shatter."
        },
        sensors: [
          {
            id: "evap_temp",
            name: "Evaporator Water Temp",
            shortName: "Evap Temp",
            unit: "°C",
            min: -5,
            max: 30,
            norm: 6.8,
            warnLow: 2.2,
            critLow: 0.4,
            precision: 1
          },
          {
            id: "cond_press",
            name: "Condenser Refrigerant Press",
            shortName: "Cond Press",
            unit: "Bar",
            min: 0,
            max: 25,
            norm: 11.5,
            warnHigh: 16.8,
            critHigh: 19.8,
            precision: 1
          },
          {
            id: "comp_curr",
            name: "Compressor Motor Current",
            shortName: "Comp Current",
            unit: "A",
            min: 0,
            max: 400,
            norm: 215.0,
            warnHigh: 315.0,
            critHigh: 365.0,
            precision: 0
          }
        ]
      }
    ]
  },
  {
    id: "U4",
    name: "Unit 4: Thermal & Boiler Systems",
    code: "U4-THM",
    location: "Boiler House - East",
    machines: [
      {
        id: "M-401",
        name: "High-Pressure Industrial Boiler",
        type: "Industrial Boiler",
        model: "ThermalMaster HP-40",
        acousticBaseline: "Steady burner flame roar 88 dBA",
        acousticDiagnostics: {
          ok: "Burner flame acoustic roar uniform.",
          warn: "Flame flutter acoustic resonance. Fuel nozzle pulsation detected.",
          crit: "Acoustic hiss in steam drum relief line. Micro-leak pressure breach."
        },
        sensors: [
          {
            id: "steam_press",
            name: "Main Steam Line Pressure",
            shortName: "Steam Press",
            unit: "Bar",
            min: 0,
            max: 40,
            norm: 18.5,
            warnHigh: 28.5,
            critHigh: 34.5,
            precision: 1
          },
          {
            id: "flue_temp",
            name: "Flue Gas Exhaust Temp",
            shortName: "Flue Temp",
            unit: "°C",
            min: 80,
            max: 450,
            norm: 210.0,
            warnHigh: 315.0,
            critHigh: 385.0,
            precision: 0
          },
          {
            id: "water_delta",
            name: "Drum Water Level Delta",
            shortName: "Water Delta",
            unit: "mm",
            min: -100,
            max: 100,
            norm: 2.0,
            warnHigh: 45.0,
            critHigh: 75.0,
            warnLow: -45.0,
            critLow: -75.0,
            precision: 1
          }
        ]
      },
      {
        id: "M-402",
        name: "Evaporative Cooling Tower",
        type: "Cooling Tower",
        model: "AquaChill Tower 300",
        acousticBaseline: "Water cascade rush & 180 RPM fan rotation",
        acousticDiagnostics: {
          ok: "Fan gear drive acoustic transmission steady.",
          warn: "Unbalanced aerodynamic rumble on Fan Blade #3.",
          crit: "Gearbox tooth engagement clatter. Severe gear wear acoustic footprint."
        },
        sensors: [
          {
            id: "water_flow",
            name: "Cooling Water Flow Rate",
            shortName: "Water Flow",
            unit: "m³/h",
            min: 0,
            max: 1200,
            norm: 935.0,
            warnLow: 620.0,
            critLow: 460.0,
            precision: 0
          },
          {
            id: "fan_vib",
            name: "Fan Shaft Vibration",
            shortName: "Fan Vib",
            unit: "mm/s",
            min: 0,
            max: 20,
            norm: 2.4,
            warnHigh: 8.2,
            critHigh: 13.5,
            precision: 2
          },
          {
            id: "basin_temp",
            name: "Basin Water Temp",
            shortName: "Basin Temp",
            unit: "°C",
            min: 10,
            max: 60,
            norm: 23.5,
            warnHigh: 37.5,
            critHigh: 46.5,
            precision: 1
          }
        ]
      }
    ]
  },
  {
    id: "U5",
    name: "Unit 5: Polymer & Molding Systems",
    code: "U5-POLY",
    location: "Plastics Division",
    machines: [
      {
        id: "M-501",
        name: "Twin-Screw Polymer Extruder",
        type: "Extruder",
        model: "PolyExtrud 90T",
        acousticBaseline: "High-torque twin screw meshing acoustics",
        acousticDiagnostics: {
          ok: "Screw meshing & polymer shear sound within normal decibel envelope.",
          warn: "High frequency squeal in Barrel Zone 3. Polymer unmelt friction.",
          crit: "Screw binder grinding acoustic shock. Severe mechanical binding."
        },
        sensors: [
          {
            id: "barrel_temp3",
            name: "Barrel Temp Zone 3",
            shortName: "Barrel Temp",
            unit: "°C",
            min: 50,
            max: 300,
            norm: 194.0,
            warnHigh: 242.0,
            critHigh: 278.0,
            precision: 1
          },
          {
            id: "melt_press",
            name: "Polymer Melt Pressure",
            shortName: "Melt Press",
            unit: "Bar",
            min: 0,
            max: 500,
            norm: 255.0,
            warnHigh: 385.0,
            critHigh: 445.0,
            precision: 0
          },
          {
            id: "screw_torque",
            name: "Extruder Screw Torque",
            shortName: "Screw Torque",
            unit: "Nm",
            min: 0,
            max: 1500,
            norm: 710.0,
            warnHigh: 1160.0,
            critHigh: 1360.0,
            precision: 0
          }
        ]
      },
      {
        id: "M-502",
        name: "Industrial Injection Molding",
        type: "Packaging / Molding",
        model: "FormMaster 650",
        acousticBaseline: "High-speed hydraulic clamp & injection cycle acoustics",
        acousticDiagnostics: {
          ok: "Mold lock & toggle acoustics synchronized.",
          warn: "Hydraulic hammer pulse on clamp lockup stroke.",
          crit: "Tie-bar stress acoustic pop. High risk of mechanical clamp yield."
        },
        sensors: [
          {
            id: "inj_press",
            name: "Injection Pressure",
            shortName: "Inj Press",
            unit: "Bar",
            min: 0,
            max: 2000,
            norm: 1120.0,
            warnHigh: 1620.0,
            critHigh: 1860.0,
            precision: 0
          },
          {
            id: "mold_temp",
            name: "Mold Surface Temp",
            shortName: "Mold Temp",
            unit: "°C",
            min: 20,
            max: 160,
            norm: 68.5,
            warnHigh: 116.0,
            critHigh: 136.0,
            precision: 1
          },
          {
            id: "clamp_force",
            name: "Toggle Clamping Force",
            shortName: "Clamp Force",
            unit: "kN",
            min: 0,
            max: 5000,
            norm: 3820.0,
            warnLow: 2750.0,
            critLow: 2150.0,
            precision: 0
          }
        ]
      }
    ]
  },
  {
    id: "U6",
    name: "Unit 6: Automated Assembly & Robotics",
    code: "U6-ROB",
    location: "Assembly Bay C",
    machines: [
      {
        id: "M-601",
        name: "6-Axis Articulated Robotic Arm",
        type: "Robotic Arm",
        model: "RoboArm Axis-6 Pro",
        acousticBaseline: "Harmonic drive gear acoustics across 6 axes",
        acousticDiagnostics: {
          ok: "Harmonic drive acoustic signature quiet across all 6 axes.",
          warn: "Axis 3 gear tooth engagement click. Lubricant depletion suspect.",
          crit: "High friction servo scream & gear chatter on Axis 3 wrist."
        },
        sensors: [
          {
            id: "joint3_temp",
            name: "Joint 3 Servo Temp",
            shortName: "Joint 3 Temp",
            unit: "°C",
            min: 20,
            max: 110,
            norm: 41.5,
            warnHigh: 73.0,
            critHigh: 89.0,
            precision: 1
          },
          {
            id: "encoder_drift",
            name: "Encoder Position Drift",
            shortName: "Encoder Drift",
            unit: "mm",
            min: 0,
            max: 10,
            norm: 0.35,
            warnHigh: 3.1,
            critHigh: 5.4,
            precision: 2
          },
          {
            id: "servo_load",
            name: "Servomotor Load Ratio",
            shortName: "Servo Load",
            unit: "%",
            min: 0,
            max: 100,
            norm: 45.0,
            warnHigh: 81.0,
            critHigh: 93.0,
            precision: 1
          }
        ]
      },
      {
        id: "M-602",
        name: "Automated Packaging Conveyor",
        type: "Conveyor Motor",
        model: "ConvSpeed Track-100",
        acousticBaseline: "Continuous roller bed rumble 62 dBA",
        acousticDiagnostics: {
          ok: "Roller bed acoustic signature smooth & rhythmic.",
          warn: "Squeal on drive pulley head bearing. High friction.",
          crit: "Belt slippage squeal & head roller metal-on-metal grinding."
        },
        sensors: [
          {
            id: "belt_tension",
            name: "Conveyor Belt Tension",
            shortName: "Belt Tension",
            unit: "N",
            min: 0,
            max: 2500,
            norm: 1840.0,
            warnLow: 1180.0,
            critLow: 880.0,
            precision: 0
          },
          {
            id: "motor_temp",
            name: "Drive Motor Temp",
            shortName: "Motor Temp",
            unit: "°C",
            min: 20,
            max: 120,
            norm: 43.0,
            warnHigh: 77.0,
            critHigh: 93.0,
            precision: 1
          },
          {
            id: "cycle_speed",
            name: "Line Cycle Throughput",
            shortName: "Cycle Speed",
            unit: "CPM",
            min: 0,
            max: 300,
            norm: 224.0,
            warnLow: 135.0,
            critLow: 95.0,
            precision: 0
          }
        ]
      }
    ]
  }
];

// Sensor Threshold Evaluator
export function evalSensorStatus(sensorMeta, val) {
  if (val === undefined || val === null) return 'ok';

  if (sensorMeta.critHigh !== undefined && val >= sensorMeta.critHigh) return 'critical';
  if (sensorMeta.critLow !== undefined && val <= sensorMeta.critLow) return 'critical';

  if (sensorMeta.warnHigh !== undefined && val >= sensorMeta.warnHigh) return 'warning';
  if (sensorMeta.warnLow !== undefined && val <= sensorMeta.warnLow) return 'warning';

  return 'ok';
}

// Acoustic Score Status Evaluator (0 - 100%)
export function evalAcousticStatus(score) {
  if (score >= 65) return 'critical';
  if (score >= 38) return 'warning';
  return 'ok';
}

// Overall Machine Status Evaluator
export function evalMachineStatus(sensorValues, acousticScore, machineMeta) {
  let overall = 'ok';

  if (evalAcousticStatus(acousticScore) === 'critical') return 'critical';
  if (evalAcousticStatus(acousticScore) === 'warning') overall = 'warning';

  for (const sMeta of machineMeta.sensors) {
    const val = sensorValues[sMeta.id];
    const sStatus = evalSensorStatus(sMeta, val);
    if (sStatus === 'critical') return 'critical';
    if (sStatus === 'warning') overall = 'warning';
  }

  return overall;
}
