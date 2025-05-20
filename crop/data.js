const cropData = {
    wheat: {
        nextCrops: ["soybean", "corn", "potato"],
        benefits: {
            soybean: "Soybeans fix nitrogen in the soil, which wheat depletes.",
            corn: "Corn has different nutrient needs and pest profiles than wheat.",
            potato: "Potatoes break disease cycles and utilize different soil layers.",
        },
        organicFertilizers: [
            { name: "Compost", description: "Rich in nutrients and improves soil structure." },
            { name: "Green Manure", description: "Plant cover crops like clover to enrich soil." },
            { name: "Bone Meal", description: "High in phosphorus, good for root development." },
        ],
        soil: 'loamy',
        region: 'temperate',
        name: 'Wheat (Gehun)'
    },
    rice: {
        nextCrops: ["pulses", "wheat", "mustard"],
        benefits: {
            pulses: "Pulses (like moong or urad) fix nitrogen and improve soil fertility after rice.",
            wheat: "Wheat-rice is a traditional rotation in Indo-Gangetic plains, different water requirements help soil recovery.",
            mustard: "Mustard has deep roots that break hardpan and adds organic matter to soil.",
        },
        organicFertilizers: [
            { name: "Jeevamrut", description: "Traditional bio-fertilizer made from cow dung, urine, and local ingredients." },
            { name: "Green Manure", description: "Dhaincha or Sesbania for nitrogen fixation before rice transplanting." },
            { name: "Azolla", description: "Aquatic fern that fixes nitrogen in rice paddies." },
        ],
        soil: 'clay',
        region: 'tropical',
        name: 'Rice (Dhan)'
    },
    sugarcane: {
        nextCrops: ["moong", "chickpea", "potato"],
        benefits: {
            moong: "Short duration crop that fixes nitrogen after sugarcane harvest.",
            chickpea: "Improves soil structure and adds nitrogen for next crop.",
            potato: "Different root system helps break pest cycles and utilize nutrients.",
        },
        organicFertilizers: [
            { name: "Press Mud Compost", description: "Sugarcane industry byproduct rich in nutrients." },
            { name: "Farm Manure", description: "Well-decomposed cow dung manure for sustained nutrition." },
            { name: "Bone Meal", description: "Rich in phosphorus for root development." },
        ],
        soil: 'loamy',
        region: 'tropical',
        name: 'Sugarcane (Ganna)'
    },
    pulses: {
        nextCrops: ["rice", "maize", "cotton"],
        benefits: {
            rice: "Rice benefits from nitrogen fixed by pulses.",
            maize: "Maize utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after pulses.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in pulse crops." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Pulses (Dal)'
    },
    cotton: {
        nextCrops: ["chickpea", "wheat", "sorghum"],
        benefits: {
            chickpea: "Winter chickpea fixes nitrogen and uses residual moisture.",
            wheat: "Wheat utilizes different soil layers and breaks disease cycle.",
            sorghum: "Drought-resistant crop that helps manage soil moisture.",
        },
        organicFertilizers: [
            { name: "Neem Oil Cake", description: "Natural pest deterrent and nutrient source." },
            { name: "Composted Manure", description: "Well-rotted manure for slow release of nutrients." },
            { name: "Beejamrut", description: "Traditional seed treatment for better germination." },
        ],
        soil: 'sandy',
        region: 'tropical',
        name: 'Cotton (Kapas)'
    },
    groundnut: {
        nextCrops: ["jowar", "pearl-millet", "maize"],
        benefits: {
            jowar: "Sorghum/jowar is drought tolerant and uses residual fertility.",
            "pearl-millet": "Bajra/pearl-millet has deep roots and drought tolerance.",
            maize: "Maize benefits from nitrogen fixed by groundnut.",
        },
        organicFertilizers: [
            { name: "Phosphate Rich Organic Manure", description: "Enhances pod development and oil content." },
            { name: "Trichoderma Enriched FYM", description: "Protects from soil-borne diseases." },
            { name: "Karanj Cake", description: "Natural pest repellent and nutrient source." },
        ],
        soil: 'sandy',
        region: 'tropical',
        name: 'Groundnut (Moongfali)'
    },
    maize: {
        nextCrops: ["soybean", "wheat", "alfalfa"],
        benefits: {
            soybean: "Soybeans fix nitrogen depleted by corn.",
            wheat: "Wheat has different root structures and disease profiles.",
            alfalfa: "Deep roots break compaction and fix nitrogen.",
        },
        organicFertilizers: [
            { name: "Composted Manure", description: "High in nitrogen needed for corn growth." },
            { name: "Cover Crops", description: "Plant winter rye to prevent erosion and add organic matter." },
            { name: "Worm Castings", description: "Rich in microbes and nutrients for soil health." },
        ],
        soil: 'loamy',
        region: 'tropical',
        name: 'Maize (Makka)'
    },
    sorghum: {
        nextCrops: ["pulses", "wheat", "groundnut"],
        benefits: {
            pulses: "Pulses fix nitrogen and improve soil structure.",
            wheat: "Wheat utilizes different soil layers and breaks disease cycle.",
            groundnut: "Groundnut benefits from improved soil structure after sorghum.",
        },
        organicFertilizers: [
            { name: "Farm Manure", description: "Well-decomposed cow dung manure for sustained nutrition." },
            { name: "Green Manure", description: "Plant cover crops like clover to enrich soil." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better root development." },
        ],
        soil: 'sandy',
        region: 'arid',
        name: 'Sorghum (Jowar)'
    },
    'pearl-millet': {
        nextCrops: ["pulses", "wheat", "groundnut"],
        benefits: {
            pulses: "Pulses fix nitrogen and improve soil structure.",
            wheat: "Wheat utilizes different soil layers and breaks disease cycle.",
            groundnut: "Groundnut benefits from improved soil structure after pearl millet.",
        },
        organicFertilizers: [
            { name: "Farm Manure", description: "Well-decomposed cow dung manure for sustained nutrition." },
            { name: "Green Manure", description: "Plant cover crops like clover to enrich soil." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better root development." },
        ],
        soil: 'sandy',
        region: 'arid',
        name: 'Pearl Millet (Bajra)'
    },
    chickpea: {
        nextCrops: ["wheat", "sorghum", "cotton"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by chickpea.",
            sorghum: "Sorghum utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after chickpea.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in chickpea." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Chickpea (Chana)'
    },
    mustard: {
        nextCrops: ["wheat", "pulses", "maize"],
        benefits: {
            wheat: "Wheat benefits from improved soil structure after mustard.",
            pulses: "Pulses fix nitrogen and improve soil fertility.",
            maize: "Maize utilizes residual nutrients and has different pest profile.",
        },
        organicFertilizers: [
            { name: "Farm Manure", description: "Well-decomposed cow dung manure for sustained nutrition." },
            { name: "Green Manure", description: "Plant cover crops like clover to enrich soil." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better root development." },
        ],
        soil: 'loamy',
        region: 'temperate',
        name: 'Mustard (Sarson)'
    },
    moong: {
        nextCrops: ["wheat", "sorghum", "cotton"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by moong.",
            sorghum: "Sorghum utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after moong.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in moong." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Green Gram (Moong)'
    },
    soybean: {
        nextCrops: ["wheat", "maize", "pulses"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by soybean.",
            maize: "Maize utilizes residual nitrogen and has different pest profile.",
            pulses: "Pulses benefit from improved soil structure after soybean.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in soybean." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'loamy',
        region: 'temperate',
        name: 'Soybean (Soya)'
    },
    potato: {
        nextCrops: ["wheat", "pulses", "maize"],
        benefits: {
            wheat: "Wheat benefits from improved soil structure after potato.",
            pulses: "Pulses fix nitrogen and improve soil fertility.",
            maize: "Maize utilizes residual nutrients and has different pest profile.",
        },
        organicFertilizers: [
            { name: "Farm Manure", description: "Well-decomposed cow dung manure for sustained nutrition." },
            { name: "Green Manure", description: "Plant cover crops like clover to enrich soil." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better root development." },
        ],
        soil: 'loamy',
        region: 'temperate',
        name: 'Potato (Aloo)'
    },
    corn: {
        nextCrops: ["soybean", "wheat", "alfalfa"],
        benefits: {
            soybean: "Soybeans fix nitrogen depleted by corn.",
            wheat: "Wheat has different root structures and disease profiles.",
            alfalfa: "Deep roots break compaction and fix nitrogen.",
        },
        organicFertilizers: [
            { name: "Composted Manure", description: "High in nitrogen needed for corn growth." },
            { name: "Cover Crops", description: "Plant winter rye to prevent erosion and add organic matter." },
            { name: "Worm Castings", description: "Rich in microbes and nutrients for soil health." },
        ],
        soil: 'loamy',
        region: 'tropical',
        name: 'Corn (Makka)'
    },
    alfalfa: {
        nextCrops: ["wheat", "maize", "potato"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by alfalfa.",
            maize: "Maize utilizes residual nitrogen and has different pest profile.",
            potato: "Potato benefits from improved soil structure after alfalfa.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in alfalfa." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'loamy',
        region: 'temperate',
        name: 'Alfalfa (Rijka)'
    },
    legumes: {
        nextCrops: ["wheat", "maize", "potato"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by legumes.",
            maize: "Maize utilizes residual nitrogen and has different pest profile.",
            potato: "Potato benefits from improved soil structure after legumes.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in legumes." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Legumes (Faliyan)'
    },
    jowar: {
        nextCrops: ["pulses", "wheat", "groundnut"],
        benefits: {
            pulses: "Pulses fix nitrogen and improve soil structure.",
            wheat: "Wheat utilizes different soil layers and breaks disease cycle.",
            groundnut: "Groundnut benefits from improved soil structure after jowar.",
        },
        organicFertilizers: [
            { name: "Farm Manure", description: "Well-decomposed cow dung manure for sustained nutrition." },
            { name: "Green Manure", description: "Plant cover crops like clover to enrich soil." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better root development." },
        ],
        soil: 'sandy',
        region: 'arid',
        name: 'Jowar (Sorghum)'
    },
    cowpea: {
        nextCrops: ["wheat", "sorghum", "cotton"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by cowpea.",
            sorghum: "Sorghum utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after cowpea.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in cowpea." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Cowpea (Lobia/Chawli)'
    },
    'mung bean': {
        nextCrops: ["wheat", "sorghum", "cotton"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by mung bean.",
            sorghum: "Sorghum utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after mung bean.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in mung bean." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Mung Bean (Moong)'
    },
    pigeonpea: {
        nextCrops: ["wheat", "sorghum", "cotton"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by pigeonpea.",
            sorghum: "Sorghum utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after pigeonpea.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in pigeonpea." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Pigeonpea (Arhar/Tur Dal)'
    },
    arhar: {
        nextCrops: ["wheat", "sorghum", "cotton"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by arhar.",
            sorghum: "Sorghum utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after arhar.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in arhar." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Pigeonpea (Arhar/Tur Dal)'
    },
    tur: {
        nextCrops: ["wheat", "sorghum", "cotton"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by tur.",
            sorghum: "Sorghum utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after tur.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in tur." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Pigeonpea (Arhar/Tur Dal)'
    },
    'tur dal': {
        nextCrops: ["wheat", "sorghum", "cotton"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by tur dal.",
            sorghum: "Sorghum utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after tur dal.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in tur dal." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Pigeonpea (Arhar/Tur Dal)'
    },
    lobia: {
        nextCrops: ["wheat", "sorghum", "cotton"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by lobia.",
            sorghum: "Sorghum utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after lobia.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in lobia." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Cowpea (Lobia/Chawli)'
    },
    chawli: {
        nextCrops: ["wheat", "sorghum", "cotton"],
        benefits: {
            wheat: "Wheat benefits from nitrogen fixed by chawli.",
            sorghum: "Sorghum utilizes residual nitrogen and has different pest profile.",
            cotton: "Cotton benefits from improved soil structure after chawli.",
        },
        organicFertilizers: [
            { name: "Rhizobium Culture", description: "Enhances nitrogen fixation in chawli." },
            { name: "Rock Phosphate", description: "Natural source of phosphorus for better nodulation." },
            { name: "Ghanjeevamrut", description: "Solid form of Jeevamrut, rich in beneficial microbes." },
        ],
        soil: 'sandy',
        region: 'subtropical',
        name: 'Cowpea (Lobia/Chawli)'
    }
}; 