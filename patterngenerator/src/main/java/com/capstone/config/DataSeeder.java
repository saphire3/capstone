package com.capstone.config;

import com.capstone.model.*;
import com.capstone.repository.AdjustmentRuleRepository;
import com.capstone.repository.BasePatternRepository;
import com.capstone.repository.MeasurementDefinitionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
            MeasurementDefinitionRepository measurementDefinitionRepository,
            BasePatternRepository basePatternRepository,
            AdjustmentRuleRepository adjustmentRuleRepository,
            JdbcTemplate jdbcTemplate
    ) {
        return args -> {
            try {
                jdbcTemplate.execute(
                    "ALTER TABLE base_patterns MODIFY COLUMN category VARCHAR(50) NOT NULL"
                );
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute(
                    "ALTER TABLE measurement_definitions MODIFY COLUMN code VARCHAR(50) NOT NULL"
                );
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute(
                    "ALTER TABLE adjustment_rules MODIFY COLUMN measurement_code VARCHAR(50) NOT NULL"
                );
            } catch (Exception ignored) {}

            String[][] categoryMigrations = {
                {"T_SHIRT","TOPS"},{"SLEEVELESS_TOP","TOPS"},{"LONG_SLEEVE","TOPS"},
                {"CROP_TOP","TOPS"},{"BLOUSE","TOPS"},{"HOODIE","TOPS"},
                {"REGULAR_PANTS","BOTTOMS"},{"SHORTS","BOTTOMS"},{"JOGGERS","BOTTOMS"},{"LEGGINGS","BOTTOMS"},
                {"MINI_SKIRT","SKIRTS"},{"MIDI_SKIRT","SKIRTS"},{"MAXI_SKIRT","SKIRTS"},{"PLEATED_SKIRT","SKIRTS"},
                {"BOMBER_JACKET","JACKETS"},{"BLAZER","JACKETS"},{"DENIM_JACKET","JACKETS"},{"PUFFER_JACKET","JACKETS"},
                {"MINI_DRESS","DRESSES"},{"MIDI_DRESS","DRESSES"},{"MAXI_DRESS","DRESSES"},{"WRAP_DRESS","DRESSES"},
                {"TRENCH_COAT","COATS"},{"PEA_COAT","COATS"},{"OVERCOAT","COATS"},{"PUFFER_COAT","COATS"},
                {"BRIEFS","UNDERWEAR"},{"BOXERS","UNDERWEAR"},{"BRALETTE","UNDERWEAR"},{"SPORTS_BRA","UNDERWEAR"},
                {"BODYSUIT","SHAPEWEAR"},{"CORSET","SHAPEWEAR"},{"SHAPING_SHORTS","SHAPEWEAR"},{"FULL_BODY_SHAPER","SHAPEWEAR"}
            };
            for (String[] m : categoryMigrations) {
                jdbcTemplate.update("UPDATE base_patterns SET category = ? WHERE category = ?", m[1], m[0]);
            }


            if (measurementDefinitionRepository.count() == 0) {
                seedMeasurementDefinition(
                        measurementDefinitionRepository,
                        MeasurementCode.CHEST,
                        "Chest",
                        "cm",
                        "Full chest circumference"
                );

                seedMeasurementDefinition(
                        measurementDefinitionRepository,
                        MeasurementCode.SHOULDER_WIDTH,
                        "Shoulder Width",
                        "cm",
                        "Distance across shoulders"
                );

                seedMeasurementDefinition(
                        measurementDefinitionRepository,
                        MeasurementCode.SHIRT_LENGTH,
                        "Shirt Length",
                        "cm",
                        "Length from shoulder to hem"
                );

                seedMeasurementDefinition(
                        measurementDefinitionRepository,
                        MeasurementCode.SLEEVE_LENGTH,
                        "Sleeve Length",
                        "cm",
                        "Length of sleeve"
                );

                seedMeasurementDefinition(
                        measurementDefinitionRepository,
                        MeasurementCode.WAIST,
                        "Waist",
                        "cm",
                        "Waist circumference"
                );

                seedMeasurementDefinition(
                        measurementDefinitionRepository,
                        MeasurementCode.HIP,
                        "Hip",
                        "cm",
                        "Hip circumference"
                );

                seedMeasurementDefinition(
                        measurementDefinitionRepository,
                        MeasurementCode.OUTSEAM,
                        "Outseam",
                        "cm",
                        "Outer leg length"

                );
            }

            seedMeasurementDefinition(measurementDefinitionRepository, MeasurementCode.NECK,
                    "Neck", "cm", "Neck circumference");
            seedMeasurementDefinition(measurementDefinitionRepository, MeasurementCode.ARMHOLE_DEPTH,
                    "Armhole Depth", "cm", "Depth of armhole from shoulder");
            seedMeasurementDefinition(measurementDefinitionRepository, MeasurementCode.BICEP,
                    "Bicep", "cm", "Bicep circumference");

            java.util.Set<String> seededNames = new java.util.HashSet<>();
            basePatternRepository.findAll().forEach(p -> seededNames.add(p.getPatternName()));

            basePatternRepository.findAll().stream()
                .filter(p -> "Basic T-Shirt".equals(p.getPatternName()))
                .forEach(p -> {
                    p.setGeometryJson("{}");
                    p.setBaseChest(96.0);
                    p.setBaseShoulderWidth(44.0);
                    p.setBaseShirtLength(68.0);
                    p.setBaseSleeveLength(22.0);
                    p.setBaseNeck(39.0);
                    p.setBaseArmholeDepth(22.5);
                    p.setBaseBicep(34.0);
                    p.setBaseWaist(88.0);
                    p.setBaseHip(98.0);
                    basePatternRepository.save(p);
                    adjustmentRuleRepository.findByBasePatternId(p.getId())
                        .forEach(adjustmentRuleRepository::delete);
                    System.out.println("[DataSeeder] Synced Basic T-Shirt to formula-based generation.");
                });

            basePatternRepository.findAll().stream()
                .filter(p -> "Sleeveless Top".equals(p.getPatternName()))
                .forEach(p -> {
                    p.setGeometryJson("{}");
                    p.setBaseChest(92.0);
                    p.setBaseShoulderWidth(38.0);
                    p.setBaseShirtLength(62.0);
                    p.setBaseSleeveLength(0.0);
                    p.setBaseNeck(36.0);
                    p.setBaseArmholeDepth(20.5);
                    p.setBaseBicep(0.0);
                    p.setBaseWaist(76.0);
                    p.setBaseHip(96.0);
                    basePatternRepository.save(p);
                    adjustmentRuleRepository.findByBasePatternId(p.getId())
                        .forEach(adjustmentRuleRepository::delete);
                    System.out.println("[DataSeeder] Synced Sleeveless Top to formula-based generation.");
                });

            basePatternRepository.findAll().stream()
                .filter(p -> "Long Sleeve Top".equals(p.getPatternName()) || "Oversized Long Sleeve Top".equals(p.getPatternName()))
                .forEach(p -> {
                    p.setGeometryJson("{}");
                    p.setBaseChest(96.0);
                    p.setBaseShoulderWidth(44.0);
                    p.setBaseShirtLength(68.0);
                    p.setBaseSleeveLength(58.0);
                    p.setBaseNeck(39.0);
                    p.setBaseArmholeDepth(22.5);
                    p.setBaseBicep(34.0);
                    p.setBaseWaist(88.0);
                    p.setBaseHip(98.0);
                    basePatternRepository.save(p);
                    adjustmentRuleRepository.findByBasePatternId(p.getId())
                        .forEach(adjustmentRuleRepository::delete);
                    p.setPatternName("Oversized Long Sleeve Top");
                    basePatternRepository.save(p);
                    System.out.println("[DataSeeder] Synced/renamed to Oversized Long Sleeve Top.");
                });

            basePatternRepository.findAll().stream()
                .filter(p -> "Crop Top".equals(p.getPatternName()))
                .forEach(p -> {
                    p.setGeometryJson("{}");
                    p.setBaseChest(92.0);
                    p.setBaseShoulderWidth(38.0);
                    p.setBaseShirtLength(36.0);
                    p.setBaseSleeveLength(15.0);
                    p.setBaseNeck(36.0);
                    p.setBaseArmholeDepth(20.5);
                    p.setBaseBicep(32.0);
                    p.setBaseWaist(76.0);
                    p.setBaseHip(96.0);
                    basePatternRepository.save(p);
                    adjustmentRuleRepository.findByBasePatternId(p.getId())
                        .forEach(adjustmentRuleRepository::delete);
                    System.out.println("[DataSeeder] Synced Crop Top to formula-based generation.");
                });

            if (!seededNames.contains("Basic T-Shirt")) {
                basePatternRepository.save(
                        BasePattern.builder()
                                .patternName("Basic T-Shirt")
                                .category(PatternCategory.TOPS)
                                .baseChest(96.0)
                                .baseShoulderWidth(44.0)
                                .baseShirtLength(68.0)
                                .baseSleeveLength(22.0)
                                .baseNeck(39.0)
                                .baseArmholeDepth(22.5)
                                .baseBicep(34.0)
                                .baseWaist(88.0)
                                .baseHip(98.0)
                                .baseOutseam(0.0)
                                .geometryJson("{}")
                                .description("Basic T-shirt pattern (formula-generated)")
                                .build()
                );
            }

            if (!seededNames.contains("Sleeveless Top")) {
                basePatternRepository.save(
                        BasePattern.builder()
                                .patternName("Sleeveless Top")
                                .category(PatternCategory.TOPS)
                                .baseChest(92.0)
                                .baseShoulderWidth(38.0)
                                .baseShirtLength(62.0)
                                .baseSleeveLength(0.0)
                                .baseNeck(36.0)
                                .baseArmholeDepth(20.5)
                                .baseBicep(0.0)
                                .baseWaist(76.0)
                                .baseHip(96.0)
                                .baseOutseam(0.0)
                                .geometryJson("{}")
                                .description("Sleeveless top pattern (formula-generated)")
                                .build()
                );
            }

            if (!seededNames.contains("Regular Pants")) {
                String pantsGeometry = """
                {
                  "pieces": [
                    {
                      "name": "front",
                      "points": {
                        "A": {"x": 18, "y": 0},
                        "B": {"x": 48, "y": 4},
                        "C": {"x": 52, "y": 20},
                        "D": {"x": 46, "y": 34},
                        "E": {"x": 40, "y": 56},
                        "F": {"x": 38, "y": 120},
                        "G": {"x": 24, "y": 120},
                        "H": {"x": 20, "y": 56},
                        "I": {"x": 12, "y": 34},
                        "J": {"x": 10, "y": 18}
                      },
                      "segments": [
                        { "type": "line", "from": "A", "to": "B" },
                        {
                          "type": "curve",
                          "from": "B",
                          "cp1": { "x": 52, "y": 10 },
                          "cp2": { "x": 54, "y": 16 },
                          "to": "C"
                        },
                        { "type": "line", "from": "C", "to": "D" },
                        {
                          "type": "curve",
                          "from": "D",
                          "cp1": { "x": 44, "y": 44 },
                          "cp2": { "x": 42, "y": 50 },
                          "to": "E"
                        },
                        { "type": "line", "from": "E", "to": "F" },
                        { "type": "line", "from": "F", "to": "G" },
                        { "type": "line", "from": "G", "to": "H" },
                        {
                          "type": "curve",
                          "from": "H",
                          "cp1": { "x": 18, "y": 50 },
                          "cp2": { "x": 16, "y": 44 },
                          "to": "I"
                        },
                        { "type": "line", "from": "I", "to": "J" },
                        { "type": "line", "from": "J", "to": "A" }
                      ]
                    },
                    {
                      "name": "back",
                      "points": {
                        "A": {"x": 16, "y": 0},
                        "B": {"x": 52, "y": 6},
                        "C": {"x": 58, "y": 24},
                        "D": {"x": 50, "y": 38},
                        "E": {"x": 44, "y": 58},
                        "F": {"x": 42, "y": 120},
                        "G": {"x": 22, "y": 120},
                        "H": {"x": 18, "y": 58},
                        "I": {"x": 10, "y": 38},
                        "J": {"x": 8, "y": 22}
                      },
                      "segments": [
                        { "type": "line", "from": "A", "to": "B" },
                        {
                          "type": "curve",
                          "from": "B",
                          "cp1": { "x": 56, "y": 12 },
                          "cp2": { "x": 60, "y": 18 },
                          "to": "C"
                        },
                        { "type": "line", "from": "C", "to": "D" },
                        {
                          "type": "curve",
                          "from": "D",
                          "cp1": { "x": 48, "y": 46 },
                          "cp2": { "x": 46, "y": 52 },
                          "to": "E"
                        },
                        { "type": "line", "from": "E", "to": "F" },
                        { "type": "line", "from": "F", "to": "G" },
                        { "type": "line", "from": "G", "to": "H" },
                        {
                          "type": "curve",
                          "from": "H",
                          "cp1": { "x": 16, "y": 52 },
                          "cp2": { "x": 12, "y": 46 },
                          "to": "I"
                        },
                        { "type": "line", "from": "I", "to": "J" },
                        { "type": "line", "from": "J", "to": "A" }
                      ]
                    }
                  ]
                }
                """;

                BasePattern regularPants = basePatternRepository.save(
                        BasePattern.builder()
                                .patternName("Regular Pants")
                                .category(PatternCategory.BOTTOMS)
                                .baseChest(0.0)
                                .baseShoulderWidth(0.0)
                                .baseShirtLength(0.0)
                                .baseSleeveLength(0.0)
                                .baseWaist(76.0)
                                .baseHip(98.0)
                                .baseOutseam(100.0)
                                .geometryJson(pantsGeometry)
                                .description("Regular pants pattern")
                                .build()
                );
                seedBottomRules(adjustmentRuleRepository, regularPants, false);
            }

            if (!seededNames.contains("Shorts")) {
                String shortsGeometry = """
                {
                  "pieces": [
                    {
                      "name": "front",
                      "points": {
                        "A": {"x": 18, "y": 0},
                        "B": {"x": 48, "y": 4},
                        "C": {"x": 52, "y": 18},
                        "D": {"x": 46, "y": 30},
                        "E": {"x": 40, "y": 54},
                        "F": {"x": 18, "y": 54},
                        "G": {"x": 12, "y": 30},
                        "H": {"x": 10, "y": 16}
                      },
                      "segments": [
                        { "type": "line", "from": "A", "to": "B" },
                        {
                          "type": "curve",
                          "from": "B",
                          "cp1": { "x": 52, "y": 10 },
                          "cp2": { "x": 54, "y": 14 },
                          "to": "C"
                        },
                        { "type": "line", "from": "C", "to": "D" },
                        {
                          "type": "curve",
                          "from": "D",
                          "cp1": { "x": 44, "y": 40 },
                          "cp2": { "x": 42, "y": 46 },
                          "to": "E"
                        },
                        { "type": "line", "from": "E", "to": "F" },
                        {
                          "type": "curve",
                          "from": "F",
                          "cp1": { "x": 14, "y": 46 },
                          "cp2": { "x": 12, "y": 40 },
                          "to": "G"
                        },
                        { "type": "line", "from": "G", "to": "H" },
                        { "type": "line", "from": "H", "to": "A" }
                      ]
                    },
                    {
                      "name": "back",
                      "points": {
                        "A": {"x": 16, "y": 0},
                        "B": {"x": 52, "y": 6},
                        "C": {"x": 58, "y": 22},
                        "D": {"x": 50, "y": 34},
                        "E": {"x": 42, "y": 54},
                        "F": {"x": 16, "y": 54},
                        "G": {"x": 10, "y": 34},
                        "H": {"x": 8, "y": 20}
                      },
                      "segments": [
                        { "type": "line", "from": "A", "to": "B" },
                        {
                          "type": "curve",
                          "from": "B",
                          "cp1": { "x": 56, "y": 10 },
                          "cp2": { "x": 60, "y": 16 },
                          "to": "C"
                        },
                        { "type": "line", "from": "C", "to": "D" },
                        {
                          "type": "curve",
                          "from": "D",
                          "cp1": { "x": 48, "y": 42 },
                          "cp2": { "x": 44, "y": 48 },
                          "to": "E"
                        },
                        { "type": "line", "from": "E", "to": "F" },
                        {
                          "type": "curve",
                          "from": "F",
                          "cp1": { "x": 12, "y": 48 },
                          "cp2": { "x": 10, "y": 42 },
                          "to": "G"
                        },
                        { "type": "line", "from": "G", "to": "H" },
                        { "type": "line", "from": "H", "to": "A" }
                      ]
                    }
                  ]
                }
                """;

                BasePattern shorts = basePatternRepository.save(
                        BasePattern.builder()
                                .patternName("Shorts")
                                .category(PatternCategory.BOTTOMS)
                                .baseChest(0.0)
                                .baseShoulderWidth(0.0)
                                .baseShirtLength(0.0)
                                .baseSleeveLength(0.0)
                                .baseWaist(74.0)
                                .baseHip(96.0)
                                .baseOutseam(50.0)
                                .geometryJson(shortsGeometry)
                                .description("Shorts pattern")
                                .build()
                );
                seedBottomRules(adjustmentRuleRepository, shorts, true);
            }

            seedNewPatterns(basePatternRepository, adjustmentRuleRepository, seededNames);
        };
    }

    private void seedNewPatterns(BasePatternRepository basePatternRepository,
                                  AdjustmentRuleRepository adjustmentRuleRepository,
                                  java.util.Set<String> seededNames) {

        boolean hasBadRatios = adjustmentRuleRepository.findAll().stream()
                .anyMatch(r -> r.getMeasurementCode() == MeasurementCode.CHEST
                        && r.getAxis() == Axis.X
                        && Math.abs(Math.abs(r.getRatio()) - 0.05) < 0.001);
        if (hasBadRatios) {
            System.out.println("[Migration] Fixing adjustment rule ratios...");
            adjustmentRuleRepository.deleteAll();
            for (BasePattern p : basePatternRepository.findAll()) {
                reseedRulesForPattern(p, adjustmentRuleRepository);
            }
            System.out.println("[Migration] Adjustment rules updated.");
        }

        if (!seededNames.contains("Long Sleeve Top") && !seededNames.contains("Oversized Long Sleeve Top")) {
            basePatternRepository.save(BasePattern.builder()
                    .patternName("Oversized Long Sleeve Top").category(PatternCategory.TOPS)
                    .baseChest(96.0).baseShoulderWidth(44.0).baseShirtLength(68.0).baseSleeveLength(58.0)
                    .baseNeck(39.0).baseArmholeDepth(22.5).baseBicep(34.0)
                    .baseWaist(88.0).baseHip(98.0).baseOutseam(0.0)
                    .geometryJson("{}").description("Oversized long sleeve top pattern (formula-generated)").build());
        }

        if (!seededNames.contains("Crop Top")) {
            basePatternRepository.save(BasePattern.builder()
                    .patternName("Crop Top").category(PatternCategory.TOPS)
                    .baseChest(92.0).baseShoulderWidth(38.0).baseShirtLength(36.0).baseSleeveLength(15.0)
                    .baseNeck(36.0).baseArmholeDepth(20.5).baseBicep(32.0)
                    .baseWaist(76.0).baseHip(96.0).baseOutseam(0.0)
                    .geometryJson("{}").description("Crop top pattern (formula-generated)").build());
        }

        if (!seededNames.contains("Blouse")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 8,  "y": 122},
                    "B": {"x": 8,  "y": 56},
                    "C": {"x": 20, "y": 22},
                    "D": {"x": 34, "y": 10},
                    "E": {"x": 50, "y": 10},
                    "F": {"x": 62, "y": 22},
                    "G": {"x": 76, "y": 56},
                    "H": {"x": 80, "y": 86},
                    "I": {"x": 76, "y": 122}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":40}, "cp2": {"x":12,"y":26}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":36,"y":28}, "cp2": {"x":48,"y":28}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":26}, "cp2": {"x":80,"y":40}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":78,"y":70}, "cp2": {"x":82,"y":78}, "to": "H" },
                    { "type": "curve", "from": "H", "cp1": {"x":80,"y":100}, "cp2": {"x":80,"y":112}, "to": "I" },
                    { "type": "line", "from": "I", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 8,  "y": 122},
                    "B": {"x": 8,  "y": 56},
                    "C": {"x": 20, "y": 22},
                    "D": {"x": 36, "y": 12},
                    "E": {"x": 48, "y": 12},
                    "F": {"x": 62, "y": 22},
                    "G": {"x": 76, "y": 56},
                    "H": {"x": 80, "y": 86},
                    "I": {"x": 76, "y": 122}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":40}, "cp2": {"x":12,"y":26}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":38,"y":18}, "cp2": {"x":46,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":26}, "cp2": {"x":80,"y":40}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":78,"y":70}, "cp2": {"x":82,"y":78}, "to": "H" },
                    { "type": "curve", "from": "H", "cp1": {"x":80,"y":100}, "cp2": {"x":80,"y":112}, "to": "I" },
                    { "type": "line", "from": "I", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 10, "y": 42},
                    "B": {"x": 4,  "y": 28},
                    "C": {"x": 22, "y": 10},
                    "D": {"x": 42, "y": 2},
                    "E": {"x": 62, "y": 10},
                    "F": {"x": 80, "y": 28},
                    "G": {"x": 74, "y": 42}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":12}, "cp2": {"x":28,"y":2}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":56,"y":2}, "cp2": {"x":72,"y":12}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Blouse").category(PatternCategory.TOPS)
                    .baseChest(92.0).baseShoulderWidth(40.0).baseShirtLength(70.0).baseSleeveLength(24.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Blouse pattern with flared hem").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Hoodie")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 8,  "y": 128},
                    "B": {"x": 8,  "y": 54},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 32, "y": 10},
                    "E": {"x": 52, "y": 10},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 76, "y": 54},
                    "H": {"x": 76, "y": 128}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":40}, "cp2": {"x":10,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":34,"y":28}, "cp2": {"x":50,"y":28}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":74,"y":28}, "cp2": {"x":80,"y":40}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 8,  "y": 128},
                    "B": {"x": 8,  "y": 54},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 34, "y": 12},
                    "E": {"x": 50, "y": 12},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 76, "y": 54},
                    "H": {"x": 76, "y": 128}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":40}, "cp2": {"x":10,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":36,"y":18}, "cp2": {"x":48,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":74,"y":28}, "cp2": {"x":80,"y":40}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 8,  "y": 62},
                    "B": {"x": 2,  "y": 38},
                    "C": {"x": 22, "y": 14},
                    "D": {"x": 44, "y": 4},
                    "E": {"x": 66, "y": 14},
                    "F": {"x": 86, "y": 38},
                    "G": {"x": 80, "y": 62}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":16}, "cp2": {"x":30,"y":4}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":58,"y":4}, "cp2": {"x":76,"y":16}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                },
                {
                  "name": "hood",
                  "points": {
                    "A": {"x": 0,  "y": 0},
                    "B": {"x": 40, "y": 0},
                    "C": {"x": 40, "y": 36},
                    "D": {"x": 20, "y": 42},
                    "E": {"x": 0,  "y": 36}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "line", "from": "B", "to": "C" },
                    { "type": "curve", "from": "C", "cp1": {"x":42,"y":40}, "cp2": {"x":30,"y":44}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":10,"y":44}, "cp2": {"x":-2,"y":40}, "to": "E" },
                    { "type": "line", "from": "E", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Hoodie").category(PatternCategory.TOPS)
                    .baseChest(100.0).baseShoulderWidth(46.0).baseShirtLength(72.0).baseSleeveLength(60.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Hoodie with hood piece").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Joggers")) {
            basePatternRepository.save(BasePattern.builder()
                    .patternName("Joggers").category(PatternCategory.BOTTOMS)
                    .baseChest(0.0).baseShoulderWidth(0.0).baseShirtLength(0.0).baseSleeveLength(0.0)
                    .baseWaist(78.0).baseHip(100.0).baseOutseam(100.0)
                    .geometryJson("{\"pieces\":[]}").description("Jogger pants with tapered leg").build());
        }

        if (!seededNames.contains("Leggings")) {
            basePatternRepository.save(BasePattern.builder()
                    .patternName("Leggings").category(PatternCategory.BOTTOMS)
                    .baseChest(0.0).baseShoulderWidth(0.0).baseShirtLength(0.0).baseSleeveLength(0.0)
                    .baseWaist(72.0).baseHip(96.0).baseOutseam(98.0)
                    .geometryJson("{\"pieces\":[]}").description("Fitted leggings pattern").build());
        }

        if (!seededNames.contains("Mini Skirt")) {
            basePatternRepository.save(BasePattern.builder()
                    .patternName("Mini Skirt").category(PatternCategory.SKIRTS)
                    .baseChest(0.0).baseShoulderWidth(0.0).baseShirtLength(0.0).baseSleeveLength(0.0)
                    .baseWaist(74.0).baseHip(98.0).baseOutseam(78.0)
                    .geometryJson("{\"pieces\":[]}").description("Mini skirt pattern").build());
        }

        if (!seededNames.contains("Midi Skirt")) {
            basePatternRepository.save(BasePattern.builder()
                    .patternName("Midi Skirt").category(PatternCategory.SKIRTS)
                    .baseChest(0.0).baseShoulderWidth(0.0).baseShirtLength(0.0).baseSleeveLength(0.0)
                    .baseWaist(74.0).baseHip(98.0).baseOutseam(100.0)
                    .geometryJson("{\"pieces\":[]}").description("Midi skirt pattern").build());
        }

        if (!seededNames.contains("Maxi Skirt")) {
            basePatternRepository.save(BasePattern.builder()
                    .patternName("Maxi Skirt").category(PatternCategory.SKIRTS)
                    .baseChest(0.0).baseShoulderWidth(0.0).baseShirtLength(0.0).baseSleeveLength(0.0)
                    .baseWaist(74.0).baseHip(98.0).baseOutseam(105.0)
                    .geometryJson("{\"pieces\":[]}").description("Maxi skirt pattern").build());
        }

        if (!seededNames.contains("Pleated Skirt")) {
            basePatternRepository.save(BasePattern.builder()
                    .patternName("Pleated Skirt").category(PatternCategory.SKIRTS)
                    .baseChest(0.0).baseShoulderWidth(0.0).baseShirtLength(0.0).baseSleeveLength(0.0)
                    .baseWaist(74.0).baseHip(98.0).baseOutseam(100.0)
                    .geometryJson("{\"pieces\":[]}").description("Pleated skirt with full hem").build());
        }

        if (!seededNames.contains("Bomber Jacket")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 8,  "y": 68},
                    "B": {"x": 8,  "y": 50},
                    "C": {"x": 16, "y": 20},
                    "D": {"x": 32, "y": 8},
                    "E": {"x": 52, "y": 8},
                    "F": {"x": 66, "y": 20},
                    "G": {"x": 78, "y": 50},
                    "H": {"x": 78, "y": 68}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":36}, "cp2": {"x":10,"y":24}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":34,"y":24}, "cp2": {"x":50,"y":24}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":74,"y":24}, "cp2": {"x":82,"y":36}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 8,  "y": 68},
                    "B": {"x": 8,  "y": 50},
                    "C": {"x": 16, "y": 20},
                    "D": {"x": 34, "y": 10},
                    "E": {"x": 50, "y": 10},
                    "F": {"x": 66, "y": 20},
                    "G": {"x": 78, "y": 50},
                    "H": {"x": 78, "y": 68}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":36}, "cp2": {"x":10,"y":24}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":36,"y":16}, "cp2": {"x":48,"y":16}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":74,"y":24}, "cp2": {"x":82,"y":36}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 6,  "y": 62},
                    "B": {"x": 0,  "y": 38},
                    "C": {"x": 22, "y": 12},
                    "D": {"x": 44, "y": 2},
                    "E": {"x": 66, "y": 12},
                    "F": {"x": 88, "y": 38},
                    "G": {"x": 82, "y": 62}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":16}, "cp2": {"x":30,"y":2}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":58,"y":2}, "cp2": {"x":76,"y":16}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Bomber Jacket").category(PatternCategory.JACKETS)
                    .baseChest(100.0).baseShoulderWidth(46.0).baseShirtLength(62.0).baseSleeveLength(60.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Bomber jacket pattern").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Blazer")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 10, "y": 90},
                    "B": {"x": 10, "y": 54},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 32, "y": 10},
                    "E": {"x": 52, "y": 10},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 76, "y": 54},
                    "H": {"x": 76, "y": 90}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":6,"y":40}, "cp2": {"x":12,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":34,"y":26}, "cp2": {"x":50,"y":26}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":28}, "cp2": {"x":80,"y":40}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 10, "y": 90},
                    "B": {"x": 10, "y": 54},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 34, "y": 12},
                    "E": {"x": 50, "y": 12},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 76, "y": 54},
                    "H": {"x": 76, "y": 90}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":6,"y":40}, "cp2": {"x":12,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":36,"y":18}, "cp2": {"x":48,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":28}, "cp2": {"x":80,"y":40}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 8,  "y": 62},
                    "B": {"x": 2,  "y": 38},
                    "C": {"x": 22, "y": 12},
                    "D": {"x": 44, "y": 2},
                    "E": {"x": 66, "y": 12},
                    "F": {"x": 86, "y": 38},
                    "G": {"x": 80, "y": 62}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":16}, "cp2": {"x":30,"y":2}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":58,"y":2}, "cp2": {"x":74,"y":16}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Blazer").category(PatternCategory.JACKETS)
                    .baseChest(98.0).baseShoulderWidth(44.0).baseShirtLength(74.0).baseSleeveLength(60.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Structured blazer pattern").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Denim Jacket")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 8,  "y": 66},
                    "B": {"x": 8,  "y": 52},
                    "C": {"x": 16, "y": 22},
                    "D": {"x": 32, "y": 10},
                    "E": {"x": 52, "y": 10},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 78, "y": 52},
                    "H": {"x": 78, "y": 66}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":38}, "cp2": {"x":10,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":34,"y":26}, "cp2": {"x":50,"y":26}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":74,"y":28}, "cp2": {"x":82,"y":38}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 8,  "y": 66},
                    "B": {"x": 8,  "y": 52},
                    "C": {"x": 16, "y": 22},
                    "D": {"x": 34, "y": 12},
                    "E": {"x": 50, "y": 12},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 78, "y": 52},
                    "H": {"x": 78, "y": 66}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":38}, "cp2": {"x":10,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":36,"y":18}, "cp2": {"x":48,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":74,"y":28}, "cp2": {"x":82,"y":38}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 6,  "y": 62},
                    "B": {"x": 0,  "y": 38},
                    "C": {"x": 22, "y": 14},
                    "D": {"x": 44, "y": 4},
                    "E": {"x": 66, "y": 14},
                    "F": {"x": 88, "y": 38},
                    "G": {"x": 82, "y": 62}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":18}, "cp2": {"x":30,"y":4}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":58,"y":4}, "cp2": {"x":76,"y":18}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Denim Jacket").category(PatternCategory.JACKETS)
                    .baseChest(100.0).baseShoulderWidth(46.0).baseShirtLength(60.0).baseSleeveLength(60.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Classic denim jacket pattern").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Puffer Jacket")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 6,  "y": 74},
                    "B": {"x": 6,  "y": 56},
                    "C": {"x": 14, "y": 24},
                    "D": {"x": 30, "y": 10},
                    "E": {"x": 56, "y": 10},
                    "F": {"x": 72, "y": 24},
                    "G": {"x": 84, "y": 56},
                    "H": {"x": 84, "y": 74}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":2,"y":42}, "cp2": {"x":8,"y":30}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":32,"y":26}, "cp2": {"x":54,"y":26}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":78,"y":30}, "cp2": {"x":88,"y":42}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 6,  "y": 74},
                    "B": {"x": 6,  "y": 56},
                    "C": {"x": 14, "y": 24},
                    "D": {"x": 32, "y": 12},
                    "E": {"x": 54, "y": 12},
                    "F": {"x": 72, "y": 24},
                    "G": {"x": 84, "y": 56},
                    "H": {"x": 84, "y": 74}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":2,"y":42}, "cp2": {"x":8,"y":30}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":34,"y":18}, "cp2": {"x":52,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":78,"y":30}, "cp2": {"x":88,"y":42}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 6,  "y": 64},
                    "B": {"x": 0,  "y": 40},
                    "C": {"x": 22, "y": 14},
                    "D": {"x": 46, "y": 4},
                    "E": {"x": 70, "y": 14},
                    "F": {"x": 92, "y": 40},
                    "G": {"x": 86, "y": 64}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":18}, "cp2": {"x":32,"y":4}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":60,"y":4}, "cp2": {"x":80,"y":18}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Puffer Jacket").category(PatternCategory.JACKETS)
                    .baseChest(106.0).baseShoulderWidth(48.0).baseShirtLength(68.0).baseSleeveLength(62.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Puffer jacket with wide body").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Mini Dress")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 10, "y": 88},
                    "B": {"x": 10, "y": 54},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 34, "y": 10},
                    "E": {"x": 50, "y": 10},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 74, "y": 54},
                    "H": {"x": 78, "y": 88}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":6,"y":40}, "cp2": {"x":12,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":36,"y":28}, "cp2": {"x":48,"y":28}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":28}, "cp2": {"x":78,"y":40}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":76,"y":68}, "cp2": {"x":80,"y":78}, "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 10, "y": 88},
                    "B": {"x": 10, "y": 54},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 36, "y": 12},
                    "E": {"x": 48, "y": 12},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 74, "y": 54},
                    "H": {"x": 78, "y": 88}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":6,"y":40}, "cp2": {"x":12,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":38,"y":18}, "cp2": {"x":46,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":28}, "cp2": {"x":78,"y":40}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":76,"y":68}, "cp2": {"x":80,"y":78}, "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 10, "y": 26},
                    "B": {"x": 4,  "y": 18},
                    "C": {"x": 22, "y": 6},
                    "D": {"x": 42, "y": 0},
                    "E": {"x": 62, "y": 6},
                    "F": {"x": 80, "y": 18},
                    "G": {"x": 74, "y": 26}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":6}, "cp2": {"x":28,"y":0}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":56,"y":0}, "cp2": {"x":72,"y":6}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Mini Dress").category(PatternCategory.DRESSES)
                    .baseChest(92.0).baseShoulderWidth(40.0).baseShirtLength(88.0).baseSleeveLength(18.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Mini dress with short sleeve").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Midi Dress")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 8,  "y": 118},
                    "B": {"x": 8,  "y": 54},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 34, "y": 10},
                    "E": {"x": 50, "y": 10},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 74, "y": 54},
                    "H": {"x": 80, "y": 118}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":40}, "cp2": {"x":12,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":36,"y":28}, "cp2": {"x":48,"y":28}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":28}, "cp2": {"x":78,"y":40}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":76,"y":80}, "cp2": {"x":82,"y":100}, "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 8,  "y": 118},
                    "B": {"x": 8,  "y": 54},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 36, "y": 12},
                    "E": {"x": 48, "y": 12},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 74, "y": 54},
                    "H": {"x": 80, "y": 118}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":40}, "cp2": {"x":12,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":38,"y":18}, "cp2": {"x":46,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":28}, "cp2": {"x":78,"y":40}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":76,"y":80}, "cp2": {"x":82,"y":100}, "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 10, "y": 54},
                    "B": {"x": 4,  "y": 34},
                    "C": {"x": 22, "y": 12},
                    "D": {"x": 42, "y": 4},
                    "E": {"x": 62, "y": 12},
                    "F": {"x": 80, "y": 34},
                    "G": {"x": 74, "y": 54}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":14}, "cp2": {"x":28,"y":4}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":56,"y":4}, "cp2": {"x":72,"y":14}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Midi Dress").category(PatternCategory.DRESSES)
                    .baseChest(92.0).baseShoulderWidth(40.0).baseShirtLength(118.0).baseSleeveLength(52.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Midi dress with long sleeve").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Maxi Dress")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 6,  "y": 148},
                    "B": {"x": 6,  "y": 54},
                    "C": {"x": 16, "y": 22},
                    "D": {"x": 32, "y": 10},
                    "E": {"x": 52, "y": 10},
                    "F": {"x": 68, "y": 22},
                    "G": {"x": 76, "y": 54},
                    "H": {"x": 84, "y": 148}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":2,"y":40}, "cp2": {"x":10,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":34,"y":28}, "cp2": {"x":50,"y":28}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":74,"y":28}, "cp2": {"x":80,"y":40}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":78,"y":90}, "cp2": {"x":86,"y":120}, "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 6,  "y": 148},
                    "B": {"x": 6,  "y": 54},
                    "C": {"x": 16, "y": 22},
                    "D": {"x": 34, "y": 12},
                    "E": {"x": 50, "y": 12},
                    "F": {"x": 68, "y": 22},
                    "G": {"x": 76, "y": 54},
                    "H": {"x": 84, "y": 148}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":2,"y":40}, "cp2": {"x":10,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":36,"y":18}, "cp2": {"x":48,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":74,"y":28}, "cp2": {"x":80,"y":40}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":78,"y":90}, "cp2": {"x":86,"y":120}, "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Maxi Dress").category(PatternCategory.DRESSES)
                    .baseChest(92.0).baseShoulderWidth(40.0).baseShirtLength(148.0).baseSleeveLength(0.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Maxi dress sleeveless").build());
            seedTopRules(adjustmentRuleRepository, p, true);
        }

        if (!seededNames.contains("Wrap Dress")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front-right",
                  "points": {
                    "A": {"x": 0,  "y": 110},
                    "B": {"x": 0,  "y": 52},
                    "C": {"x": 10, "y": 22},
                    "D": {"x": 26, "y": 10},
                    "E": {"x": 50, "y": 10},
                    "F": {"x": 62, "y": 22},
                    "G": {"x": 70, "y": 52},
                    "H": {"x": 72, "y": 110}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":-4,"y":38}, "cp2": {"x":4,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":28,"y":26}, "cp2": {"x":48,"y":26}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":68,"y":28}, "cp2": {"x":74,"y":38}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":72,"y":78}, "cp2": {"x":74,"y":96}, "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 8,  "y": 110},
                    "B": {"x": 8,  "y": 54},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 36, "y": 12},
                    "E": {"x": 48, "y": 12},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 74, "y": 54},
                    "H": {"x": 76, "y": 110}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":40}, "cp2": {"x":12,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":38,"y":18}, "cp2": {"x":46,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":28}, "cp2": {"x":78,"y":40}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":76,"y":78}, "cp2": {"x":78,"y":96}, "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 10, "y": 42},
                    "B": {"x": 4,  "y": 28},
                    "C": {"x": 22, "y": 10},
                    "D": {"x": 42, "y": 2},
                    "E": {"x": 62, "y": 10},
                    "F": {"x": 80, "y": 28},
                    "G": {"x": 74, "y": 42}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":12}, "cp2": {"x":28,"y":2}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":56,"y":2}, "cp2": {"x":72,"y":12}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Wrap Dress").category(PatternCategory.DRESSES)
                    .baseChest(92.0).baseShoulderWidth(40.0).baseShirtLength(110.0).baseSleeveLength(24.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Wrap dress with flared skirt").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Trench Coat")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 6,  "y": 130},
                    "B": {"x": 6,  "y": 54},
                    "C": {"x": 14, "y": 22},
                    "D": {"x": 30, "y": 8},
                    "E": {"x": 54, "y": 8},
                    "F": {"x": 70, "y": 22},
                    "G": {"x": 82, "y": 54},
                    "H": {"x": 86, "y": 130}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":2,"y":40}, "cp2": {"x":8,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":32,"y":24}, "cp2": {"x":52,"y":24}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":78,"y":28}, "cp2": {"x":86,"y":40}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":84,"y":88}, "cp2": {"x":88,"y":110}, "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 6,  "y": 130},
                    "B": {"x": 6,  "y": 54},
                    "C": {"x": 14, "y": 22},
                    "D": {"x": 32, "y": 10},
                    "E": {"x": 52, "y": 10},
                    "F": {"x": 70, "y": 22},
                    "G": {"x": 82, "y": 54},
                    "H": {"x": 86, "y": 130}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":2,"y":40}, "cp2": {"x":8,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":34,"y":16}, "cp2": {"x":50,"y":16}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":78,"y":28}, "cp2": {"x":86,"y":40}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":84,"y":88}, "cp2": {"x":88,"y":110}, "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 8,  "y": 64},
                    "B": {"x": 2,  "y": 40},
                    "C": {"x": 22, "y": 14},
                    "D": {"x": 46, "y": 4},
                    "E": {"x": 70, "y": 14},
                    "F": {"x": 90, "y": 40},
                    "G": {"x": 84, "y": 64}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":18}, "cp2": {"x":32,"y":4}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":60,"y":4}, "cp2": {"x":80,"y":18}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Trench Coat").category(PatternCategory.COATS)
                    .baseChest(102.0).baseShoulderWidth(46.0).baseShirtLength(130.0).baseSleeveLength(62.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Classic trench coat").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Pea Coat")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 8,  "y": 96},
                    "B": {"x": 8,  "y": 54},
                    "C": {"x": 16, "y": 22},
                    "D": {"x": 32, "y": 10},
                    "E": {"x": 54, "y": 10},
                    "F": {"x": 68, "y": 22},
                    "G": {"x": 80, "y": 54},
                    "H": {"x": 82, "y": 96}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":40}, "cp2": {"x":10,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":34,"y":26}, "cp2": {"x":52,"y":26}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":76,"y":28}, "cp2": {"x":84,"y":40}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 8,  "y": 96},
                    "B": {"x": 8,  "y": 54},
                    "C": {"x": 16, "y": 22},
                    "D": {"x": 34, "y": 12},
                    "E": {"x": 52, "y": 12},
                    "F": {"x": 68, "y": 22},
                    "G": {"x": 80, "y": 54},
                    "H": {"x": 82, "y": 96}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":40}, "cp2": {"x":10,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":36,"y":18}, "cp2": {"x":50,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":76,"y":28}, "cp2": {"x":84,"y":40}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 8,  "y": 62},
                    "B": {"x": 2,  "y": 38},
                    "C": {"x": 22, "y": 12},
                    "D": {"x": 46, "y": 2},
                    "E": {"x": 70, "y": 12},
                    "F": {"x": 90, "y": 38},
                    "G": {"x": 84, "y": 62}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":16}, "cp2": {"x":32,"y":2}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":60,"y":2}, "cp2": {"x":80,"y":16}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Pea Coat").category(PatternCategory.COATS)
                    .baseChest(102.0).baseShoulderWidth(46.0).baseShirtLength(96.0).baseSleeveLength(62.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Double-breasted pea coat").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Overcoat")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 6,  "y": 138},
                    "B": {"x": 6,  "y": 56},
                    "C": {"x": 14, "y": 24},
                    "D": {"x": 30, "y": 10},
                    "E": {"x": 56, "y": 10},
                    "F": {"x": 72, "y": 24},
                    "G": {"x": 84, "y": 56},
                    "H": {"x": 86, "y": 138}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":2,"y":42}, "cp2": {"x":8,"y":30}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":32,"y":26}, "cp2": {"x":54,"y":26}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":80,"y":30}, "cp2": {"x":88,"y":42}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 6,  "y": 138},
                    "B": {"x": 6,  "y": 56},
                    "C": {"x": 14, "y": 24},
                    "D": {"x": 32, "y": 12},
                    "E": {"x": 54, "y": 12},
                    "F": {"x": 72, "y": 24},
                    "G": {"x": 84, "y": 56},
                    "H": {"x": 86, "y": 138}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":2,"y":42}, "cp2": {"x":8,"y":30}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":34,"y":18}, "cp2": {"x":52,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":80,"y":30}, "cp2": {"x":88,"y":42}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 8,  "y": 66},
                    "B": {"x": 2,  "y": 42},
                    "C": {"x": 22, "y": 16},
                    "D": {"x": 46, "y": 6},
                    "E": {"x": 70, "y": 16},
                    "F": {"x": 90, "y": 42},
                    "G": {"x": 84, "y": 66}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":20}, "cp2": {"x":32,"y":6}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":60,"y":6}, "cp2": {"x":80,"y":20}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Overcoat").category(PatternCategory.COATS)
                    .baseChest(104.0).baseShoulderWidth(48.0).baseShirtLength(138.0).baseSleeveLength(64.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Long classic overcoat").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Puffer Coat")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 4,  "y": 110},
                    "B": {"x": 4,  "y": 56},
                    "C": {"x": 12, "y": 24},
                    "D": {"x": 28, "y": 10},
                    "E": {"x": 58, "y": 10},
                    "F": {"x": 74, "y": 24},
                    "G": {"x": 88, "y": 56},
                    "H": {"x": 90, "y": 110}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":0,"y":42}, "cp2": {"x":6,"y":30}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":30,"y":26}, "cp2": {"x":56,"y":26}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":82,"y":30}, "cp2": {"x":92,"y":42}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 4,  "y": 110},
                    "B": {"x": 4,  "y": 56},
                    "C": {"x": 12, "y": 24},
                    "D": {"x": 30, "y": 12},
                    "E": {"x": 56, "y": 12},
                    "F": {"x": 74, "y": 24},
                    "G": {"x": 88, "y": 56},
                    "H": {"x": 90, "y": 110}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":0,"y":42}, "cp2": {"x":6,"y":30}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":32,"y":18}, "cp2": {"x":54,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":82,"y":30}, "cp2": {"x":92,"y":42}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "sleeve",
                  "points": {
                    "A": {"x": 6,  "y": 66},
                    "B": {"x": 0,  "y": 42},
                    "C": {"x": 22, "y": 16},
                    "D": {"x": 48, "y": 6},
                    "E": {"x": 74, "y": 16},
                    "F": {"x": 96, "y": 42},
                    "G": {"x": 90, "y": 66}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":12,"y":20}, "cp2": {"x":34,"y":6}, "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":62,"y":6}, "cp2": {"x":84,"y":20}, "to": "F" },
                    { "type": "line", "from": "F", "to": "G" },
                    { "type": "line", "from": "G", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Puffer Coat").category(PatternCategory.COATS)
                    .baseChest(108.0).baseShoulderWidth(50.0).baseShirtLength(110.0).baseSleeveLength(64.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Long puffer coat with wide body").build());
            seedTopRules(adjustmentRuleRepository, p, false);
        }

        if (!seededNames.contains("Briefs")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 0,   "y": 0},
                    "B": {"x": 19,  "y": 0},
                    "C": {"x": 22,  "y": 10},
                    "D": {"x": 18,  "y": 26},
                    "E": {"x": 0,   "y": 26}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":22,"y":4}, "cp2": {"x":24,"y":8}, "to": "C" },
                    { "type": "curve", "from": "C", "cp1": {"x":22,"y":18}, "cp2": {"x":20,"y":22}, "to": "D" },
                    { "type": "line", "from": "D", "to": "E" },
                    { "type": "line", "from": "E", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 0,   "y": 0},
                    "B": {"x": 20,  "y": 0},
                    "C": {"x": 24,  "y": 12},
                    "D": {"x": 20,  "y": 28},
                    "E": {"x": 0,   "y": 28}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":24,"y":4}, "cp2": {"x":26,"y":8}, "to": "C" },
                    { "type": "curve", "from": "C", "cp1": {"x":24,"y":20}, "cp2": {"x":22,"y":24}, "to": "D" },
                    { "type": "line", "from": "D", "to": "E" },
                    { "type": "line", "from": "E", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Briefs").category(PatternCategory.UNDERWEAR)
                    .baseChest(0.0).baseShoulderWidth(0.0).baseShirtLength(0.0).baseSleeveLength(0.0)
                    .baseWaist(70.0).baseHip(94.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Classic briefs underwear").build());
            seedBottomRules(adjustmentRuleRepository, p, true);
        }

        if (!seededNames.contains("Boxers")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 0,  "y": 0},
                    "B": {"x": 24, "y": 0},
                    "C": {"x": 28, "y": 14},
                    "D": {"x": 24, "y": 38},
                    "E": {"x": 0,  "y": 38}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":28,"y":4}, "cp2": {"x":30,"y":10}, "to": "C" },
                    { "type": "curve", "from": "C", "cp1": {"x":28,"y":24}, "cp2": {"x":26,"y":32}, "to": "D" },
                    { "type": "line", "from": "D", "to": "E" },
                    { "type": "line", "from": "E", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 0,  "y": 0},
                    "B": {"x": 26, "y": 0},
                    "C": {"x": 30, "y": 16},
                    "D": {"x": 26, "y": 40},
                    "E": {"x": 0,  "y": 40}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":30,"y":4}, "cp2": {"x":32,"y":12}, "to": "C" },
                    { "type": "curve", "from": "C", "cp1": {"x":30,"y":26}, "cp2": {"x":28,"y":34}, "to": "D" },
                    { "type": "line", "from": "D", "to": "E" },
                    { "type": "line", "from": "E", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Boxers").category(PatternCategory.UNDERWEAR)
                    .baseChest(0.0).baseShoulderWidth(0.0).baseShirtLength(0.0).baseSleeveLength(0.0)
                    .baseWaist(80.0).baseHip(100.0).baseOutseam(42.0)
                    .geometryJson(geo).description("Boxer shorts underwear").build());
            seedBottomRules(adjustmentRuleRepository, p, true);
        }

        if (!seededNames.contains("Bralette")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "cup",
                  "points": {
                    "A": {"x": 0,  "y": 0},
                    "B": {"x": 14, "y": 0},
                    "C": {"x": 18, "y": 10},
                    "D": {"x": 14, "y": 20},
                    "E": {"x": 0,  "y": 20}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":18,"y":2}, "cp2": {"x":20,"y":6}, "to": "C" },
                    { "type": "curve", "from": "C", "cp1": {"x":20,"y":14}, "cp2": {"x":18,"y":18}, "to": "D" },
                    { "type": "line", "from": "D", "to": "E" },
                    { "type": "line", "from": "E", "to": "A" }
                  ]
                },
                {
                  "name": "band",
                  "points": {
                    "A": {"x": 0,  "y": 0},
                    "B": {"x": 46, "y": 0},
                    "C": {"x": 46, "y": 8},
                    "D": {"x": 0,  "y": 8}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "line", "from": "B", "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "line", "from": "D", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Bralette").category(PatternCategory.UNDERWEAR)
                    .baseChest(88.0).baseShoulderWidth(0.0).baseShirtLength(0.0).baseSleeveLength(0.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Soft bralette with cup and band").build());
            adjustmentRuleRepository.save(rule(p, "band", "B", MeasurementCode.CHEST, Axis.X, 0.05, "Band right"));
            adjustmentRuleRepository.save(rule(p, "band", "C", MeasurementCode.CHEST, Axis.X, 0.05, "Band right bottom"));
        }

        if (!seededNames.contains("Sports Bra")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 8,  "y": 38},
                    "B": {"x": 8,  "y": 22},
                    "C": {"x": 18, "y": 8},
                    "D": {"x": 32, "y": 2},
                    "E": {"x": 52, "y": 2},
                    "F": {"x": 66, "y": 8},
                    "G": {"x": 76, "y": 22},
                    "H": {"x": 76, "y": 38}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":14}, "cp2": {"x":12,"y":6}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":34,"y":14}, "cp2": {"x":50,"y":14}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":6}, "cp2": {"x":80,"y":14}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 8,  "y": 38},
                    "B": {"x": 8,  "y": 22},
                    "C": {"x": 18, "y": 8},
                    "D": {"x": 34, "y": 4},
                    "E": {"x": 50, "y": 4},
                    "F": {"x": 66, "y": 8},
                    "G": {"x": 76, "y": 22},
                    "H": {"x": 76, "y": 38}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":4,"y":14}, "cp2": {"x":12,"y":6}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":36,"y":10}, "cp2": {"x":48,"y":10}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":6}, "cp2": {"x":80,"y":14}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "line", "from": "H", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Sports Bra").category(PatternCategory.UNDERWEAR)
                    .baseChest(88.0).baseShoulderWidth(40.0).baseShirtLength(38.0).baseSleeveLength(0.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Racerback sports bra").build());
            seedTopRules(adjustmentRuleRepository, p, true);
        }

        if (!seededNames.contains("Bodysuit")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 10, "y": 76},
                    "B": {"x": 10, "y": 52},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 34, "y": 10},
                    "E": {"x": 50, "y": 10},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 74, "y": 52},
                    "H": {"x": 72, "y": 76}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":6,"y":38}, "cp2": {"x":12,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":36,"y":26}, "cp2": {"x":48,"y":26}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":28}, "cp2": {"x":78,"y":38}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":74,"y":64}, "cp2": {"x":74,"y":70}, "to": "H" },
                    { "type": "curve", "from": "H", "cp1": {"x":64,"y":82}, "cp2": {"x":18,"y":82}, "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 10, "y": 76},
                    "B": {"x": 10, "y": 52},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 36, "y": 12},
                    "E": {"x": 48, "y": 12},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 74, "y": 52},
                    "H": {"x": 72, "y": 76}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":6,"y":38}, "cp2": {"x":12,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":38,"y":18}, "cp2": {"x":46,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":28}, "cp2": {"x":78,"y":38}, "to": "G" },
                    { "type": "curve", "from": "G", "cp1": {"x":74,"y":64}, "cp2": {"x":74,"y":70}, "to": "H" },
                    { "type": "curve", "from": "H", "cp1": {"x":64,"y":82}, "cp2": {"x":18,"y":82}, "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Bodysuit").category(PatternCategory.SHAPEWEAR)
                    .baseChest(90.0).baseShoulderWidth(40.0).baseShirtLength(76.0).baseSleeveLength(0.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Fitted bodysuit with snap crotch").build());
            seedTopRules(adjustmentRuleRepository, p, true);
        }

        if (!seededNames.contains("Corset")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front-panel",
                  "points": {
                    "A": {"x": 0,  "y": 0},
                    "B": {"x": 20, "y": 0},
                    "C": {"x": 22, "y": 20},
                    "D": {"x": 20, "y": 38},
                    "E": {"x": 0,  "y": 38}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":22,"y":8}, "cp2": {"x":24,"y":14}, "to": "C" },
                    { "type": "curve", "from": "C", "cp1": {"x":24,"y":28}, "cp2": {"x":22,"y":34}, "to": "D" },
                    { "type": "line", "from": "D", "to": "E" },
                    { "type": "line", "from": "E", "to": "A" }
                  ]
                },
                {
                  "name": "side-panel",
                  "points": {
                    "A": {"x": 0,  "y": 2},
                    "B": {"x": 12, "y": 0},
                    "C": {"x": 14, "y": 20},
                    "D": {"x": 12, "y": 40},
                    "E": {"x": 0,  "y": 38}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":14,"y":6}, "cp2": {"x":16,"y":12}, "to": "C" },
                    { "type": "curve", "from": "C", "cp1": {"x":16,"y":28}, "cp2": {"x":14,"y":36}, "to": "D" },
                    { "type": "line", "from": "D", "to": "E" },
                    { "type": "line", "from": "E", "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Corset").category(PatternCategory.SHAPEWEAR)
                    .baseChest(88.0).baseShoulderWidth(0.0).baseShirtLength(38.0).baseSleeveLength(0.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Structured corset with boning channels").build());
            adjustmentRuleRepository.save(rule(p, "front-panel", "B", MeasurementCode.CHEST, Axis.X, 0.04, "Front panel width"));
            adjustmentRuleRepository.save(rule(p, "front-panel", "C", MeasurementCode.CHEST, Axis.X, 0.04, "Front panel mid"));
            adjustmentRuleRepository.save(rule(p, "front-panel", "D", MeasurementCode.CHEST, Axis.X, 0.04, "Front panel hem"));
            adjustmentRuleRepository.save(rule(p, "front-panel", "D", MeasurementCode.SHIRT_LENGTH, Axis.Y, 1.0, "Front panel length"));
            adjustmentRuleRepository.save(rule(p, "front-panel", "E", MeasurementCode.SHIRT_LENGTH, Axis.Y, 1.0, "Front panel length hem"));
        }

        if (!seededNames.contains("Shaping Shorts")) {
            basePatternRepository.save(BasePattern.builder()
                    .patternName("Shaping Shorts").category(PatternCategory.SHAPEWEAR)
                    .baseChest(0.0).baseShoulderWidth(0.0).baseShirtLength(0.0).baseSleeveLength(0.0)
                    .baseWaist(72.0).baseHip(96.0).baseOutseam(46.0)
                    .geometryJson("{\"pieces\":[]}").description("Compression shaping shorts").build());
        }

        if (!seededNames.contains("Full Body Shaper")) {
            String geo = """
            {
              "pieces": [
                {
                  "name": "front",
                  "points": {
                    "A": {"x": 10, "y": 96},
                    "B": {"x": 10, "y": 52},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 34, "y": 10},
                    "E": {"x": 50, "y": 10},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 74, "y": 52},
                    "H": {"x": 72, "y": 96}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":6,"y":38}, "cp2": {"x":12,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":36,"y":26}, "cp2": {"x":48,"y":26}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":28}, "cp2": {"x":78,"y":38}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "curve", "from": "H", "cp1": {"x":64,"y":100}, "cp2": {"x":18,"y":100}, "to": "A" }
                  ]
                },
                {
                  "name": "back",
                  "points": {
                    "A": {"x": 10, "y": 96},
                    "B": {"x": 10, "y": 52},
                    "C": {"x": 18, "y": 22},
                    "D": {"x": 36, "y": 12},
                    "E": {"x": 48, "y": 12},
                    "F": {"x": 66, "y": 22},
                    "G": {"x": 74, "y": 52},
                    "H": {"x": 72, "y": 96}
                  },
                  "segments": [
                    { "type": "line", "from": "A", "to": "B" },
                    { "type": "curve", "from": "B", "cp1": {"x":6,"y":38}, "cp2": {"x":12,"y":28}, "to": "C" },
                    { "type": "line", "from": "C", "to": "D" },
                    { "type": "curve", "from": "D", "cp1": {"x":38,"y":18}, "cp2": {"x":46,"y":18}, "to": "E" },
                    { "type": "line", "from": "E", "to": "F" },
                    { "type": "curve", "from": "F", "cp1": {"x":72,"y":28}, "cp2": {"x":78,"y":38}, "to": "G" },
                    { "type": "line", "from": "G", "to": "H" },
                    { "type": "curve", "from": "H", "cp1": {"x":64,"y":100}, "cp2": {"x":18,"y":100}, "to": "A" }
                  ]
                }
              ]
            }
            """;
            BasePattern p = basePatternRepository.save(BasePattern.builder()
                    .patternName("Full Body Shaper").category(PatternCategory.SHAPEWEAR)
                    .baseChest(88.0).baseShoulderWidth(40.0).baseShirtLength(96.0).baseSleeveLength(0.0)
                    .baseWaist(0.0).baseHip(0.0).baseOutseam(0.0)
                    .geometryJson(geo).description("Full body compression shaper").build());
            seedTopRules(adjustmentRuleRepository, p, true);
        }
    }

    private void seedTopRules(AdjustmentRuleRepository repo, BasePattern pattern, boolean sleeveless) {
        repo.save(rule(pattern, "front", "A", MeasurementCode.CHEST, Axis.X, -0.25, "Front hem left"));
        repo.save(rule(pattern, "front", "B", MeasurementCode.CHEST, Axis.X, -0.25, "Front side left"));
        repo.save(rule(pattern, "front", "G", MeasurementCode.CHEST, Axis.X,  0.25, "Front side right"));
        repo.save(rule(pattern, "front", "H", MeasurementCode.CHEST, Axis.X,  0.25, "Front hem right"));

        repo.save(rule(pattern, "back", "A", MeasurementCode.CHEST, Axis.X, -0.25, "Back hem left"));
        repo.save(rule(pattern, "back", "B", MeasurementCode.CHEST, Axis.X, -0.25, "Back side left"));
        repo.save(rule(pattern, "back", "G", MeasurementCode.CHEST, Axis.X,  0.25, "Back side right"));
        repo.save(rule(pattern, "back", "H", MeasurementCode.CHEST, Axis.X,  0.25, "Back hem right"));

        repo.save(rule(pattern, "front", "C", MeasurementCode.SHOULDER_WIDTH, Axis.X, -0.5, "Front shoulder left"));
        repo.save(rule(pattern, "front", "F", MeasurementCode.SHOULDER_WIDTH, Axis.X,  0.5, "Front shoulder right"));
        repo.save(rule(pattern, "back",  "C", MeasurementCode.SHOULDER_WIDTH, Axis.X, -0.5, "Back shoulder left"));
        repo.save(rule(pattern, "back",  "F", MeasurementCode.SHOULDER_WIDTH, Axis.X,  0.5, "Back shoulder right"));

        repo.save(rule(pattern, "front", "A", MeasurementCode.SHIRT_LENGTH, Axis.Y, 1.5, "Front hem left"));
        repo.save(rule(pattern, "front", "H", MeasurementCode.SHIRT_LENGTH, Axis.Y, 1.5, "Front hem right"));
        repo.save(rule(pattern, "back",  "A", MeasurementCode.SHIRT_LENGTH, Axis.Y, 1.5, "Back hem left"));
        repo.save(rule(pattern, "back",  "H", MeasurementCode.SHIRT_LENGTH, Axis.Y, 1.5, "Back hem right"));

        if (!sleeveless) {
            repo.save(rule(pattern, "sleeve", "A", MeasurementCode.SLEEVE_LENGTH, Axis.Y, 2.0, "Sleeve hem left"));
            repo.save(rule(pattern, "sleeve", "G", MeasurementCode.SLEEVE_LENGTH, Axis.Y, 2.0, "Sleeve hem right"));
        }
    }

    private void seedBottomRules(AdjustmentRuleRepository repo, BasePattern pattern, boolean shorts) {
        repo.save(rule(pattern, "front", "A", MeasurementCode.WAIST, Axis.X, -0.25, "Front waist left"));
        repo.save(rule(pattern, "front", "B", MeasurementCode.WAIST, Axis.X,  0.25, "Front waist right"));
        repo.save(rule(pattern, "back",  "A", MeasurementCode.WAIST, Axis.X, -0.25, "Back waist left"));
        repo.save(rule(pattern, "back",  "B", MeasurementCode.WAIST, Axis.X,  0.25, "Back waist right"));

        repo.save(rule(pattern, "front", "C", MeasurementCode.HIP, Axis.X,  0.25, "Front hip right curve"));
        repo.save(rule(pattern, "front", "D", MeasurementCode.HIP, Axis.Y,  0.5,  "Front hip depth"));
        repo.save(rule(pattern, "front", "E", MeasurementCode.HIP, Axis.Y,  0.5,  "Front hip depth left"));
        repo.save(rule(pattern, "back",  "C", MeasurementCode.HIP, Axis.X,  0.25, "Back hip right curve"));
        repo.save(rule(pattern, "back",  "D", MeasurementCode.HIP, Axis.Y,  0.5,  "Back hip depth"));
        repo.save(rule(pattern, "back",  "E", MeasurementCode.HIP, Axis.Y,  0.5,  "Back hip depth left"));
    }

    private AdjustmentRule rule(BasePattern pattern,
                                String pieceName,
                                String targetName,
                                MeasurementCode measurementCode,
                                Axis axis,
                                double ratio,
                                String description) {
        return AdjustmentRule.builder()
                .basePattern(pattern)
                .pieceName(pieceName)
                .targetType(PatternPointTargetType.POINT)
                .targetName(targetName)
                .measurementCode(measurementCode)
                .axis(axis)
                .ratio(ratio)
                .description(description)
                .build();
    }
    private void reseedRulesForPattern(BasePattern p, AdjustmentRuleRepository repo) {
        switch (p.getCategory()) {
            case BOTTOMS, SKIRTS, SHAPEWEAR:
                seedBottomRules(repo, p, false);
                break;
            case UNDERWEAR:
                seedBottomRules(repo, p, true);
                break;
            default:
                seedTopRules(repo, p, false);
                break;
        }
    }

    private void seedMeasurementDefinition(
            MeasurementDefinitionRepository repository,
            MeasurementCode code,
            String displayName,
            String unit,
            String description
    ) {
        boolean exists = repository.findAll()
                .stream()
                .anyMatch(md -> md.getCode() == code);

        if (!exists) {
            repository.save(
                    MeasurementDefinition.builder()
                            .code(code)
                            .displayName(displayName)
                            .unit(unit)
                            .description(description)
                            .requiredByDefault(true)
                            .build()
            );
        }
    }
}