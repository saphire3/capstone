package com.capstone.service;

import com.capstone.dto.pattern.*;
import com.capstone.model.*;
import com.capstone.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PatternService {

    private final AdjustmentRuleRepository adjustmentRuleRepository;
    private final UserMeasurementRepository userMeasurementRepository;
    private final BasePatternRepository basePatternRepository;
    private final UserRepository userRepository;
    private final UserPatternSelectionRepository userPatternSelectionRepository;
    private final MeasurementProfileRepository measurementProfileRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<BasePatternResponse> getAllPatterns() {
        return basePatternRepository.findAll()
                .stream()
                .map(this::mapBasePatternResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BasePatternResponse getPatternById(Long patternId) {
        BasePattern pattern = basePatternRepository.findById(patternId)
                .orElseThrow(() -> new EntityNotFoundException("Base pattern not found"));
        return mapBasePatternResponse(pattern);
    }

    public BasePatternResponse createPattern(CreateBasePatternRequest request) {
        BasePattern pattern = BasePattern.builder()
                .patternName(request.getPatternName().trim())
                .category(request.getCategory())
                .baseChest(request.getBaseChest())
                .baseShoulderWidth(request.getBaseShoulderWidth())
                .baseShirtLength(request.getBaseShirtLength())
                .baseSleeveLength(request.getBaseSleeveLength())
                .baseWaist(request.getBaseWaist())
                .baseHip(request.getBaseHip())
                .baseOutseam(request.getBaseOutseam())
                .baseNeck(request.getBaseNeck())
                .baseArmholeDepth(request.getBaseArmholeDepth())
                .baseBicep(request.getBaseBicep())
                .description(request.getDescription())
                .geometryJson(request.getGeometryJson())
                .build();

        BasePattern saved = basePatternRepository.save(pattern);
        return mapBasePatternResponse(saved);
    }

    public BasePatternResponse updatePattern(Long patternId, UpdateBasePatternRequest request) {
        BasePattern pattern = basePatternRepository.findById(patternId)
                .orElseThrow(() -> new EntityNotFoundException("Base pattern not found"));

        pattern.setPatternName(request.getPatternName().trim());
        pattern.setCategory(request.getCategory());
        pattern.setBaseChest(request.getBaseChest());
        pattern.setBaseShoulderWidth(request.getBaseShoulderWidth());
        pattern.setBaseShirtLength(request.getBaseShirtLength());
        pattern.setBaseSleeveLength(request.getBaseSleeveLength());
        pattern.setBaseWaist(request.getBaseWaist());
        pattern.setBaseHip(request.getBaseHip());
        pattern.setBaseOutseam(request.getBaseOutseam());
        pattern.setBaseNeck(request.getBaseNeck());
        pattern.setBaseArmholeDepth(request.getBaseArmholeDepth());
        pattern.setBaseBicep(request.getBaseBicep());
        pattern.setDescription(request.getDescription());
        pattern.setGeometryJson(request.getGeometryJson());

        BasePattern saved = basePatternRepository.save(pattern);
        return mapBasePatternResponse(saved);
    }

    public void deletePattern(Long patternId) {
        BasePattern pattern = basePatternRepository.findById(patternId)
                .orElseThrow(() -> new EntityNotFoundException("Base pattern not found"));

        userPatternSelectionRepository.findAll().stream()
                .filter(selection -> selection.getBasePattern() != null
                        && selection.getBasePattern().getId().equals(patternId))
                .forEach(userPatternSelectionRepository::delete);

        basePatternRepository.delete(pattern);
    }

    public UserPatternSelectionResponse selectPattern(Authentication authentication,
                                                      SelectPatternRequest request) {
        String username = authentication.getName();

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        BasePattern basePattern = basePatternRepository.findById(request.getBasePatternId())
                .orElseThrow(() -> new EntityNotFoundException("Base pattern not found"));

        UserPatternSelection selection = userPatternSelectionRepository.findByUserId(user.getId())
                .map(existing -> {
                    existing.setBasePattern(basePattern);
                    return existing;
                })
                .orElseGet(() -> UserPatternSelection.builder()
                        .user(user)
                        .basePattern(basePattern)
                        .build());

        UserPatternSelection saved = userPatternSelectionRepository.save(selection);

        return mapSelectionResponse(saved);
    }

    @Transactional(readOnly = true)
    public UserPatternSelectionResponse getMySelection(Authentication authentication) {
        String username = authentication.getName();

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        UserPatternSelection selection = userPatternSelectionRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("No pattern selected for this user"));

        return mapSelectionResponse(selection);
    }

    @Transactional(readOnly = true)
    public GeneratedPatternResponse generateMyPattern(Authentication authentication, Long profileId) {
        String username = authentication.getName();

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        UserPatternSelection selection = userPatternSelectionRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("No pattern selected for this user"));

        BasePattern basePattern = selection.getBasePattern();

        Map<MeasurementCode, Double> measurementMap;
        if (profileId != null) {
            MeasurementProfile profile = measurementProfileRepository.findByIdAndUserId(profileId, user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Measurement profile not found"));
            measurementMap = new HashMap<>();
            try {
                Map<String, Double> raw = objectMapper.readValue(
                        profile.getMeasurementsJson(), new TypeReference<Map<String, Double>>() {});
                for (Map.Entry<String, Double> entry : raw.entrySet()) {
                    try {
                        measurementMap.put(MeasurementCode.valueOf(entry.getKey()), entry.getValue());
                    } catch (IllegalArgumentException ignored) {}
                }
            } catch (Exception e) {
                throw new IllegalStateException("Could not read profile measurements");
            }
        } else {
            List<UserMeasurement> userMeasurements = userMeasurementRepository.findByUserId(user.getId());
            measurementMap = userMeasurements.stream()
                    .collect(Collectors.toMap(
                            um -> um.getMeasurementDefinition().getCode(),
                            UserMeasurement::getValue
                    ));
        }

        return switch (basePattern.getCategory()) {
            case TOPS -> {
                String name = basePattern.getPatternName().toLowerCase();
                if (name.contains("t-shirt") || name.contains("tshirt")
                        || name.contains("long sleeve") || name.contains("crop top")) {
                    yield generateTshirtPattern(basePattern, measurementMap);
                } else if (name.contains("sleeveless")) {
                    yield generateSleevelessTopPattern(basePattern, measurementMap);
                } else {
                    yield generateTopPattern(basePattern, measurementMap);
                }
            }
            case BOTTOMS, UNDERWEAR, SHAPEWEAR -> generateBottomPattern(basePattern, measurementMap, false);
            case SKIRTS -> generateSkirtPattern(basePattern, measurementMap, 65.0, 75.0);
            default -> generateTopPattern(basePattern, measurementMap);
        };
    }

    private GeneratedPatternResponse generateTopPattern(BasePattern basePattern,
                                                        Map<MeasurementCode, Double> measurementMap) {
        List<AdjustmentRule> adjustmentRules = adjustmentRuleRepository.findByBasePatternId(basePattern.getId());
        List<AppliedAdjustmentResponse> appliedAdjustments = new ArrayList<>();
        String adjustedGeometryJson;
        List<PieceMeasurementResponse> pieceMeasurements;

        try {
            ObjectNode root = (ObjectNode) objectMapper.readTree(basePattern.getGeometryJson());
            ArrayNode pieces = (ArrayNode) root.get("pieces");

            for (AdjustmentRule rule : adjustmentRules) {
                Double measurementValue = measurementMap.get(rule.getMeasurementCode());

                if (measurementValue == null) {
                    continue;
                }

                Double baseMeasurement = getBaseMeasurementValue(basePattern, rule.getMeasurementCode());
                Double adjustmentAmount = (measurementValue - baseMeasurement) * rule.getRatio();

                boolean applied = applyAdjustmentToGeometry(pieces, rule, adjustmentAmount);

                if (applied) {
                    appliedAdjustments.add(
                            AppliedAdjustmentResponse.builder()
                                    .pieceName(rule.getPieceName())
                                    .targetType(rule.getTargetType())
                                    .targetName(rule.getTargetName())
                                    .measurementCode(rule.getMeasurementCode())
                                    .axis(rule.getAxis())
                                    .measurementValue(measurementValue)
                                    .ratio(rule.getRatio())
                                    .adjustmentAmount(round(adjustmentAmount))
                                    .build()
                    );
                }
            }

            adjustedGeometryJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
            pieceMeasurements = calculatePieceMeasurements(root);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate adjusted geometry", e);
        }

        return GeneratedPatternResponse.builder()
                .basePatternId(basePattern.getId())
                .patternName(basePattern.getPatternName())
                .category(basePattern.getCategory().name())
                .description(basePattern.getDescription())
                .originalGeometryJson(basePattern.getGeometryJson())
                .adjustedGeometryJson(adjustedGeometryJson)
                .appliedAdjustments(appliedAdjustments)
                .pieceMeasurements(pieceMeasurements)
                .build();
    }

    private GeneratedPatternResponse generateTshirtPattern(BasePattern basePattern,
                                                            Map<MeasurementCode, Double> measurementMap) {
        double chest = getMeasurementOrBase(measurementMap, MeasurementCode.CHEST, basePattern.getBaseChest());
        double shoulder = getMeasurementOrBase(measurementMap, MeasurementCode.SHOULDER_WIDTH, basePattern.getBaseShoulderWidth());
        double shirtLength = getMeasurementOrBase(measurementMap, MeasurementCode.SHIRT_LENGTH, basePattern.getBaseShirtLength());
        if (basePattern.getPatternName().toLowerCase().contains("crop top")) {
            shirtLength = shirtLength * 0.55;
        }
        double sleeveLength = basePattern.getBaseSleeveLength() != null ? basePattern.getBaseSleeveLength() : 22.0;
        double neck = getMeasurementOrBase(measurementMap, MeasurementCode.NECK,
                basePattern.getBaseNeck() != null ? basePattern.getBaseNeck() : 39.0);
        double armholeDepth = getMeasurementOrBase(measurementMap, MeasurementCode.ARMHOLE_DEPTH,
                basePattern.getBaseArmholeDepth() != null ? basePattern.getBaseArmholeDepth() : 22.5);
        double bicep = getMeasurementOrBase(measurementMap, MeasurementCode.BICEP,
                basePattern.getBaseBicep() != null ? basePattern.getBaseBicep() : 34.0);

        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode pieces = objectMapper.createArrayNode();
        pieces.add(buildTshirtBodyPiece(chest, shoulder, shirtLength, neck, armholeDepth, true));
        pieces.add(buildTshirtBodyPiece(chest, shoulder, shirtLength, neck, armholeDepth, false));
        double frontArmholeArc = tshirtArmholeArcLength(chest, shoulder, armholeDepth, true);
        double backArmholeArc  = tshirtArmholeArcLength(chest, shoulder, armholeDepth, false);
        pieces.add(buildTshirtSleeve(bicep, sleeveLength, armholeDepth, frontArmholeArc + backArmholeArc));
        pieces.add(buildNeckband(neck));
        root.set("pieces", pieces);

        String adjustedGeometryJson;
        List<PieceMeasurementResponse> pieceMeasurements;
        try {
            adjustedGeometryJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
            pieceMeasurements = calculatePieceMeasurements(root);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate T-shirt pattern geometry", e);
        }

        return GeneratedPatternResponse.builder()
                .basePatternId(basePattern.getId())
                .patternName(basePattern.getPatternName())
                .category(basePattern.getCategory().name())
                .description(basePattern.getDescription())
                .originalGeometryJson(basePattern.getGeometryJson())
                .adjustedGeometryJson(adjustedGeometryJson)
                .appliedAdjustments(List.of())
                .pieceMeasurements(pieceMeasurements)
                .build();
    }

    private ObjectNode buildTshirtBodyPiece(double chest, double shoulder, double shirtLength,
                                              double neck, double armholeDepth, boolean isFront) {
        final double EASE = 8.0;
        final double SHOULDER_WIDTH_EASE = 6.0;
        final double MIN_SHOULDER_MARGIN = 3.0;
        final double SHOULDER_DROP = 1.9;
        final double SIDE_TOP_DROP = 0.6;
        final double ARMHOLE_WIDTH_FACTOR = 0.12;
        final double NECK_WIDTH_FACTOR = 0.50;
        final double MIN_NECK_WIDTH = 18.0;
        final double FRONT_NECK_DEPTH_FACTOR = 0.24;
        final double MIN_FRONT_NECK_DEPTH = 9.8;
        final double BACK_NECK_DEPTH = 3.0;
        final double FRONT_NECK_ROUNDNESS = 0.36;
        final double BACK_NECK_ROUNDNESS = 0.30;
        final double FRONT_ARMHOLE_INWARD = 6.6;
        final double BACK_ARMHOLE_INWARD = 5.4;
        final double FRONT_ARMHOLE_LIFT = 6.2;
        final double BACK_ARMHOLE_LIFT = 5.4;
        final double FRONT_SHOULDER_HANDLE = 0.20;
        final double BACK_SHOULDER_HANDLE = 0.18;
        final double FRONT_SHOULDER_DROP_HANDLE = 0.55;
        final double BACK_SHOULDER_DROP_HANDLE = 0.50;

        double bodyWidth = Math.max((chest + EASE) / 2.0, shoulder + SHOULDER_WIDTH_EASE);
        double centerX = bodyWidth / 2.0;

        double neckWidth = Math.max(neck * NECK_WIDTH_FACTOR, MIN_NECK_WIDTH);
        double neckDepth = isFront
                ? Math.max(neck * FRONT_NECK_DEPTH_FACTOR, MIN_FRONT_NECK_DEPTH)
                : BACK_NECK_DEPTH;
        double neckRoundness = isFront ? FRONT_NECK_ROUNDNESS : BACK_NECK_ROUNDNESS;

        double shoulderSpan = Math.min(shoulder, bodyWidth - MIN_SHOULDER_MARGIN * 2.0);
        double shoulderHalf = shoulderSpan / 2.0;

        double sideTopY = armholeDepth + SIDE_TOP_DROP;
        double widthBasedInward = bodyWidth * ARMHOLE_WIDTH_FACTOR;
        double armholeInward = Math.max(isFront ? FRONT_ARMHOLE_INWARD : BACK_ARMHOLE_INWARD, widthBasedInward);
        double armholeLift = isFront ? FRONT_ARMHOLE_LIFT : BACK_ARMHOLE_LIFT;
        double armholeShoulderHandle = isFront ? FRONT_SHOULDER_HANDLE : BACK_SHOULDER_HANDLE;
        double armholeShoulderDropHandle = isFront ? FRONT_SHOULDER_DROP_HANDLE : BACK_SHOULDER_DROP_HANDLE;

        double rightSideTopX = bodyWidth, rightSideTopY = sideTopY;
        double rightShoulderX = centerX + shoulderHalf, rightShoulderY = SHOULDER_DROP;
        double neckRightX = centerX + neckWidth / 2.0;
        double neckLeftX = centerX - neckWidth / 2.0;
        double leftShoulderX = centerX - shoulderHalf, leftShoulderY = SHOULDER_DROP;
        double leftSideTopX = 0, leftSideTopY = sideTopY;

        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", isFront ? "front" : "back");

        ObjectNode points = objectMapper.createObjectNode();
        points.set("leftHem",       point(0, shirtLength));
        points.set("rightHem",      point(bodyWidth, shirtLength));
        points.set("rightSideTop",  point(rightSideTopX, rightSideTopY));
        points.set("rightShoulder", point(rightShoulderX, rightShoulderY));
        points.set("neckRight",     point(neckRightX, 0));
        points.set("neckLeft",      point(neckLeftX, 0));
        points.set("leftShoulder",  point(leftShoulderX, leftShoulderY));
        points.set("leftSideTop",   point(leftSideTopX, leftSideTopY));
        piece.set("points", points);

        ArrayNode segments = objectMapper.createArrayNode();
        segments.add(line("leftHem", "rightHem"));
        segments.add(line("rightHem", "rightSideTop"));
        segments.add(curve("rightSideTop", "rightShoulder",
                rightSideTopX - armholeInward, rightSideTopY - armholeLift,
                rightShoulderX + armholeShoulderHandle, rightShoulderY + armholeShoulderDropHandle));
        segments.add(line("rightShoulder", "neckRight"));
        segments.add(curve("neckRight", "neckLeft",
                centerX + neckWidth * neckRoundness, neckDepth,
                centerX - neckWidth * neckRoundness, neckDepth));
        segments.add(line("neckLeft", "leftShoulder"));
        segments.add(curve("leftShoulder", "leftSideTop",
                leftShoulderX - armholeShoulderHandle, leftShoulderY + armholeShoulderDropHandle,
                leftSideTopX + armholeInward, leftSideTopY - armholeLift));
        segments.add(line("leftSideTop", "leftHem"));
        piece.set("segments", segments);

        return piece;
    }

    private ObjectNode buildTshirtSleeve(double bicep, double sleeveLength, double armholeDepth,
                                         double targetCapArc) {
        final double BICEP_EASE = 12.0;
        final double HEM_WIDTH_FACTOR = 0.78;
        final double MIN_HEM_WIDTH = 20.0;
        final double MIN_CAP_HEIGHT = 10.0;
        final double UNDERARM_DROP = 1.4;
        final double OUTER_HANDLE_X = 6.8;
        final double OUTER_HANDLE_Y = 2.3;
        final double TOP_HANDLE_X = 10.5;
        final double TOP_HANDLE_Y = 0.8;

        double bicepWidth = bicep + BICEP_EASE;
        double hemWidth = Math.max(bicepWidth * HEM_WIDTH_FACTOR, MIN_HEM_WIDTH);
        double sideMargin = (hemWidth - bicepWidth) / 2.0;

        double lo = MIN_CAP_HEIGHT, hi = armholeDepth * 2.5;
        for (int iter = 0; iter < 60; iter++) {
            double mid = (lo + hi) / 2.0;
            if (sleeveCapArcLength(mid, hemWidth, sideMargin, UNDERARM_DROP,
                    OUTER_HANDLE_X, OUTER_HANDLE_Y, TOP_HANDLE_X, TOP_HANDLE_Y) < targetCapArc) {
                lo = mid;
            } else {
                hi = mid;
            }
        }
        double capHeight = Math.max((lo + hi) / 2.0, MIN_CAP_HEIGHT);
        double totalLength = sleeveLength + capHeight;

        double capTopX = hemWidth / 2.0;
        double rightUnderX = hemWidth - sideMargin, rightUnderY = capHeight + UNDERARM_DROP;
        double leftUnderX = sideMargin, leftUnderY = capHeight + UNDERARM_DROP;

        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", "sleeve (cut 2)");

        ObjectNode points = objectMapper.createObjectNode();
        points.set("capTop",    point(capTopX, 0));
        points.set("rightUnder", point(rightUnderX, rightUnderY));
        points.set("rightHem",  point(hemWidth, totalLength));
        points.set("leftHem",   point(0, totalLength));
        points.set("leftUnder", point(leftUnderX, leftUnderY));
        piece.set("points", points);

        ArrayNode segments = objectMapper.createArrayNode();
        segments.add(line("leftHem", "rightHem"));
        segments.add(line("rightHem", "rightUnder"));
        segments.add(curve("rightUnder", "capTop",
                rightUnderX - OUTER_HANDLE_X, rightUnderY - OUTER_HANDLE_Y,
                capTopX + TOP_HANDLE_X, TOP_HANDLE_Y));
        segments.add(curve("capTop", "leftUnder",
                capTopX - TOP_HANDLE_X, TOP_HANDLE_Y,
                leftUnderX + OUTER_HANDLE_X, leftUnderY - OUTER_HANDLE_Y));
        segments.add(line("leftUnder", "leftHem"));
        piece.set("segments", segments);

        return piece;
    }

    private ObjectNode buildNeckband(double neck) {
        double length = neck * 0.84;
        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", "neckband");
        ObjectNode points = objectMapper.createObjectNode();
        points.set("a", point(0, 0));
        points.set("b", point(length, 0));
        points.set("c", point(length, 2.2));
        points.set("d", point(0, 2.2));
        piece.set("points", points);
        ArrayNode segments = objectMapper.createArrayNode();
        segments.add(line("a", "b"));
        segments.add(line("b", "c"));
        segments.add(line("c", "d"));
        segments.add(line("d", "a"));
        piece.set("segments", segments);
        return piece;
    }

    private double bezierArcLength(double x0, double y0,
                                    double cx1, double cy1,
                                    double cx2, double cy2,
                                    double x1, double y1) {
        int N = 64;
        double len = 0, prevX = x0, prevY = y0;
        for (int i = 1; i <= N; i++) {
            double t = (double) i / N, u = 1 - t;
            double bx = u*u*u*x0 + 3*u*u*t*cx1 + 3*u*t*t*cx2 + t*t*t*x1;
            double by = u*u*u*y0 + 3*u*u*t*cy1 + 3*u*t*t*cy2 + t*t*t*y1;
            double dx = bx - prevX, dy = by - prevY;
            len += Math.sqrt(dx*dx + dy*dy);
            prevX = bx; prevY = by;
        }
        return len;
    }

    private double tshirtArmholeArcLength(double chest, double shoulder, double armholeDepth, boolean isFront) {
        final double EASE = 8.0;
        final double SHOULDER_WIDTH_EASE = 6.0;
        final double MIN_SHOULDER_MARGIN = 3.0;
        final double SHOULDER_DROP = 1.9;
        final double SIDE_TOP_DROP = 0.6;
        final double ARMHOLE_WIDTH_FACTOR = 0.12;
        final double FRONT_ARMHOLE_INWARD = 6.6;
        final double BACK_ARMHOLE_INWARD = 5.4;
        final double FRONT_ARMHOLE_LIFT = 6.2;
        final double BACK_ARMHOLE_LIFT = 5.4;
        final double FRONT_SHOULDER_HANDLE = 0.20;
        final double BACK_SHOULDER_HANDLE = 0.18;
        final double FRONT_SHOULDER_DROP_HANDLE = 0.55;
        final double BACK_SHOULDER_DROP_HANDLE = 0.50;

        double bodyWidth = Math.max((chest + EASE) / 2.0, shoulder + SHOULDER_WIDTH_EASE);
        double centerX = bodyWidth / 2.0;
        double shoulderSpan = Math.min(shoulder, bodyWidth - MIN_SHOULDER_MARGIN * 2.0);
        double shoulderHalf = shoulderSpan / 2.0;
        double sideTopY = armholeDepth + SIDE_TOP_DROP;
        double armholeInward = Math.max(isFront ? FRONT_ARMHOLE_INWARD : BACK_ARMHOLE_INWARD,
                bodyWidth * ARMHOLE_WIDTH_FACTOR);
        double armholeLift = isFront ? FRONT_ARMHOLE_LIFT : BACK_ARMHOLE_LIFT;
        double shoulderHandle = isFront ? FRONT_SHOULDER_HANDLE : BACK_SHOULDER_HANDLE;
        double shoulderDropHandle = isFront ? FRONT_SHOULDER_DROP_HANDLE : BACK_SHOULDER_DROP_HANDLE;

        return bezierArcLength(
                bodyWidth, sideTopY,
                bodyWidth - armholeInward, sideTopY - armholeLift,
                centerX + shoulderHalf + shoulderHandle, SHOULDER_DROP + shoulderDropHandle,
                centerX + shoulderHalf, SHOULDER_DROP);
    }

    private double sleeveCapArcLength(double capHeight, double hemWidth, double sideMargin,
                                      double underarmDrop,
                                      double outerHandleX, double outerHandleY,
                                      double topHandleX, double topHandleY) {
        double capTopX = hemWidth / 2.0;
        double rightUnderX = hemWidth - sideMargin, rightUnderY = capHeight + underarmDrop;
        double leftUnderX  = sideMargin,             leftUnderY  = capHeight + underarmDrop;
        double right = bezierArcLength(
                rightUnderX, rightUnderY,
                rightUnderX - outerHandleX, rightUnderY - outerHandleY,
                capTopX + topHandleX, topHandleY,
                capTopX, 0);
        double left = bezierArcLength(
                capTopX, 0,
                capTopX - topHandleX, topHandleY,
                leftUnderX + outerHandleX, leftUnderY - outerHandleY,
                leftUnderX, leftUnderY);
        return right + left;
    }

    private GeneratedPatternResponse generateSleevelessTopPattern(BasePattern basePattern,
                                                                   Map<MeasurementCode, Double> measurementMap) {
        double chest = getMeasurementOrBase(measurementMap, MeasurementCode.CHEST, basePattern.getBaseChest());
        double shoulder = getMeasurementOrBase(measurementMap, MeasurementCode.SHOULDER_WIDTH, basePattern.getBaseShoulderWidth());
        double shirtLength = basePattern.getBaseShirtLength() != null ? basePattern.getBaseShirtLength() : 62.0;
        double neck = getMeasurementOrBase(measurementMap, MeasurementCode.NECK,
                basePattern.getBaseNeck() != null ? basePattern.getBaseNeck() : 36.0);
        double armholeDepth = getMeasurementOrBase(measurementMap, MeasurementCode.ARMHOLE_DEPTH,
                basePattern.getBaseArmholeDepth() != null ? basePattern.getBaseArmholeDepth() : 20.5);

        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode pieces = objectMapper.createArrayNode();
        pieces.add(buildSleevelessBodyPiece(chest, shoulder, shirtLength, neck, armholeDepth, true));
        pieces.add(buildSleevelessBodyPiece(chest, shoulder, shirtLength, neck, armholeDepth, false));
        pieces.add(buildBinding("neck binding", neck * 0.84));
        pieces.add(buildBinding("armhole binding (cut 2)", armholeDepth * 1.4 + 10.0));
        root.set("pieces", pieces);

        String adjustedGeometryJson;
        List<PieceMeasurementResponse> pieceMeasurements;
        try {
            adjustedGeometryJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
            pieceMeasurements = calculatePieceMeasurements(root);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate sleeveless top pattern geometry", e);
        }

        return GeneratedPatternResponse.builder()
                .basePatternId(basePattern.getId())
                .patternName(basePattern.getPatternName())
                .category(basePattern.getCategory().name())
                .description(basePattern.getDescription())
                .originalGeometryJson(basePattern.getGeometryJson())
                .adjustedGeometryJson(adjustedGeometryJson)
                .appliedAdjustments(List.of())
                .pieceMeasurements(pieceMeasurements)
                .build();
    }

    private ObjectNode buildSleevelessBodyPiece(double chest, double shoulder, double shirtLength,
                                                  double neck, double armholeDepth, boolean isFront) {
        final double EASE = 6.0;
        final double SHOULDER_WIDTH_EASE = 2.0;
        final double MIN_SHOULDER_MARGIN = 4.8;
        final double SHOULDER_DROP = 1.7;
        final double SIDE_TOP_DROP = 0.2;
        final double ARMHOLE_WIDTH_FACTOR = 0.16;
        final double NECK_WIDTH_FACTOR = 0.56;
        final double MIN_NECK_WIDTH = 18.5;
        final double FRONT_NECK_DEPTH_FACTOR = 0.26;
        final double MIN_FRONT_NECK_DEPTH = 9.4;
        final double BACK_NECK_DEPTH = 3.2;
        final double FRONT_NECK_ROUNDNESS = 0.36;
        final double BACK_NECK_ROUNDNESS = 0.30;
        final double FRONT_ARMHOLE_INWARD = 7.2;
        final double BACK_ARMHOLE_INWARD = 6.2;
        final double FRONT_ARMHOLE_LIFT = 6.8;
        final double BACK_ARMHOLE_LIFT = 5.9;
        final double FRONT_SHOULDER_HANDLE = 0.12;
        final double BACK_SHOULDER_HANDLE = 0.10;
        final double FRONT_SHOULDER_DROP_HANDLE = 0.45;
        final double BACK_SHOULDER_DROP_HANDLE = 0.40;

        double bodyWidth = Math.max((chest + EASE) / 2.0, shoulder + SHOULDER_WIDTH_EASE);
        double centerX = bodyWidth / 2.0;

        double neckWidth = Math.max(neck * NECK_WIDTH_FACTOR, MIN_NECK_WIDTH);
        double neckDepth = isFront
                ? Math.max(neck * FRONT_NECK_DEPTH_FACTOR, MIN_FRONT_NECK_DEPTH)
                : BACK_NECK_DEPTH;
        double neckRoundness = isFront ? FRONT_NECK_ROUNDNESS : BACK_NECK_ROUNDNESS;

        double shoulderSpan = Math.min(shoulder, bodyWidth - MIN_SHOULDER_MARGIN * 2.0);
        double shoulderHalf = shoulderSpan / 2.0;

        double sideTopY = armholeDepth + SIDE_TOP_DROP;
        double widthBasedInward = bodyWidth * ARMHOLE_WIDTH_FACTOR;
        double armholeInward = Math.max(isFront ? FRONT_ARMHOLE_INWARD : BACK_ARMHOLE_INWARD, widthBasedInward);
        double armholeLift = isFront ? FRONT_ARMHOLE_LIFT : BACK_ARMHOLE_LIFT;
        double armholeShoulderHandle = isFront ? FRONT_SHOULDER_HANDLE : BACK_SHOULDER_HANDLE;
        double armholeShoulderDropHandle = isFront ? FRONT_SHOULDER_DROP_HANDLE : BACK_SHOULDER_DROP_HANDLE;

        double rightSideTopX = bodyWidth, rightSideTopY = sideTopY;
        double rightShoulderX = centerX + shoulderHalf, rightShoulderY = SHOULDER_DROP;
        double neckRightX = centerX + neckWidth / 2.0;
        double neckLeftX = centerX - neckWidth / 2.0;
        double leftShoulderX = centerX - shoulderHalf, leftShoulderY = SHOULDER_DROP;
        double leftSideTopX = 0, leftSideTopY = sideTopY;

        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", isFront ? "front" : "back");

        ObjectNode points = objectMapper.createObjectNode();
        points.set("leftHem",       point(0, shirtLength));
        points.set("rightHem",      point(bodyWidth, shirtLength));
        points.set("rightSideTop",  point(rightSideTopX, rightSideTopY));
        points.set("rightShoulder", point(rightShoulderX, rightShoulderY));
        points.set("neckRight",     point(neckRightX, 0));
        points.set("neckLeft",      point(neckLeftX, 0));
        points.set("leftShoulder",  point(leftShoulderX, leftShoulderY));
        points.set("leftSideTop",   point(leftSideTopX, leftSideTopY));
        piece.set("points", points);

        ArrayNode segments = objectMapper.createArrayNode();
        segments.add(line("leftHem", "rightHem"));
        segments.add(line("rightHem", "rightSideTop"));
        segments.add(curve("rightSideTop", "rightShoulder",
                rightSideTopX - armholeInward, rightSideTopY - armholeLift,
                rightShoulderX + armholeShoulderHandle, rightShoulderY + armholeShoulderDropHandle));
        segments.add(line("rightShoulder", "neckRight"));
        segments.add(curve("neckRight", "neckLeft",
                centerX + neckWidth * neckRoundness, neckDepth,
                centerX - neckWidth * neckRoundness, neckDepth));
        segments.add(line("neckLeft", "leftShoulder"));
        segments.add(curve("leftShoulder", "leftSideTop",
                leftShoulderX - armholeShoulderHandle, leftShoulderY + armholeShoulderDropHandle,
                leftSideTopX + armholeInward, leftSideTopY - armholeLift));
        segments.add(line("leftSideTop", "leftHem"));
        piece.set("segments", segments);

        return piece;
    }

    private ObjectNode buildBinding(String name, double length) {
        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", name);
        ObjectNode points = objectMapper.createObjectNode();
        points.set("a", point(0, 0));
        points.set("b", point(length, 0));
        points.set("c", point(length, 2.2));
        points.set("d", point(0, 2.2));
        piece.set("points", points);
        ArrayNode segments = objectMapper.createArrayNode();
        segments.add(line("a", "b"));
        segments.add(line("b", "c"));
        segments.add(line("c", "d"));
        segments.add(line("d", "a"));
        piece.set("segments", segments);
        return piece;
    }

    private GeneratedPatternResponse generateBottomPattern(BasePattern basePattern,
                                                           Map<MeasurementCode, Double> measurementMap,
                                                           boolean shorts) {
        double waist = getMeasurementOrBase(measurementMap, MeasurementCode.WAIST, basePattern.getBaseWaist());
        double hip = getMeasurementOrBase(measurementMap, MeasurementCode.HIP, basePattern.getBaseHip());
        double outseam = getMeasurementOrBase(measurementMap, MeasurementCode.OUTSEAM, basePattern.getBaseOutseam());

        if (shorts) {
            outseam = clamp(outseam, 38.0, 60.0);
        } else {
            outseam = clamp(outseam, 90.0, 115.0);
        }

        waist = clamp(waist, 58.0, 120.0);
        hip = clamp(hip, 78.0, 140.0);

        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode pieces = objectMapper.createArrayNode();

        pieces.add(buildFrontBottomPiece(waist, hip, outseam, shorts));
        pieces.add(buildBackBottomPiece(waist, hip, outseam, shorts));

        root.set("pieces", pieces);

        String adjustedGeometryJson;
        List<PieceMeasurementResponse> pieceMeasurements;
        try {
            adjustedGeometryJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
            pieceMeasurements = calculatePieceMeasurements(root);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate bottom pattern geometry", e);
        }

        List<AppliedAdjustmentResponse> appliedAdjustments = List.of(
                AppliedAdjustmentResponse.builder()
                        .pieceName("front/back")
                        .targetType(PatternPointTargetType.POINT)
                        .targetName("formula-generated")
                        .measurementCode(MeasurementCode.WAIST)
                        .axis(Axis.X)
                        .measurementValue(waist)
                        .ratio(1.0)
                        .adjustmentAmount(round(waist))
                        .build(),
                AppliedAdjustmentResponse.builder()
                        .pieceName("front/back")
                        .targetType(PatternPointTargetType.POINT)
                        .targetName("formula-generated")
                        .measurementCode(MeasurementCode.HIP)
                        .axis(Axis.X)
                        .measurementValue(hip)
                        .ratio(1.0)
                        .adjustmentAmount(round(hip))
                        .build(),
                AppliedAdjustmentResponse.builder()
                        .pieceName("front/back")
                        .targetType(PatternPointTargetType.POINT)
                        .targetName("formula-generated")
                        .measurementCode(MeasurementCode.OUTSEAM)
                        .axis(Axis.Y)
                        .measurementValue(outseam)
                        .ratio(1.0)
                        .adjustmentAmount(round(outseam))
                        .build()
        );

        return GeneratedPatternResponse.builder()
                .basePatternId(basePattern.getId())
                .patternName(basePattern.getPatternName())
                .category(basePattern.getCategory().name())
                .description(basePattern.getDescription())
                .originalGeometryJson(basePattern.getGeometryJson())
                .adjustedGeometryJson(adjustedGeometryJson)
                .appliedAdjustments(appliedAdjustments)
                .pieceMeasurements(pieceMeasurements)
                .build();
    }

    private ObjectNode buildFrontBottomPiece(double waist, double hip, double outseam, boolean shorts) {
        double hemY = outseam;

        if (shorts) {
            double waistWidth = waist / 4.0 + 2.0;
            double hipWidth = hip / 4.0 + 4.2;
            double rise = 18.0;
            double hemWidth = hip / 8.0 + 10.5;

            ObjectNode piece = objectMapper.createObjectNode();
            piece.put("name", "front");

            ObjectNode points = objectMapper.createObjectNode();
            points.set("A", point(0.0, 0.0));
            points.set("B", point(waistWidth, 1.0));
            points.set("C", point(hipWidth, rise));
            points.set("D", point(hemWidth, hemY));
            points.set("E", point(0.0, hemY));
            points.set("F", point(-1.6, rise - 1.0));
            piece.set("points", points);

            ArrayNode segments = objectMapper.createArrayNode();
            segments.add(line("A", "B"));
            segments.add(curve("B", "C",
                    waistWidth + 1.0, rise * 0.45,
                    hipWidth - 0.3, rise * 0.88));
            segments.add(curve("C", "D",
                    hipWidth - 0.6, rise + 5.0,
                    hemWidth + 0.8, hemY * 0.55));
            segments.add(line("D", "E"));
            segments.add(curve("E", "F",
                    -0.2, hemY - 10.0,
                    -2.2, rise + 12.0));
            segments.add(curve("F", "A",
                    -2.2, rise * 0.60,
                    -0.6, 7.0));

            piece.set("segments", segments);
            return piece;
        }

        double waistWidth = waist / 4.0 + 2.5;
        double hipWidth = hip / 4.0 + 4.8;
        double rise = 24.0;
        double kneeY = outseam * 0.58;
        double hemWidth = 14.0;
        double kneeWidth = 15.8;

        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", "front");

        ObjectNode points = objectMapper.createObjectNode();
        points.set("A", point(0.0, 0.0));
        points.set("B", point(waistWidth, 1.0));
        points.set("C", point(hipWidth, rise));
        points.set("D", point(kneeWidth, kneeY));
        points.set("E", point(hemWidth, hemY));
        points.set("F", point(0.0, hemY));
        points.set("G", point(-1.8, rise - 1.0));
        piece.set("points", points);

        ArrayNode segments = objectMapper.createArrayNode();
        segments.add(line("A", "B"));
        segments.add(curve("B", "C",
                waistWidth + 1.2, rise * 0.42,
                hipWidth - 0.4, rise * 0.90));
        segments.add(curve("C", "D",
                hipWidth - 0.8, rise + 6.0,
                kneeWidth + 1.4, kneeY * 0.62));
        segments.add(line("D", "E"));
        segments.add(line("E", "F"));
        segments.add(curve("F", "G",
                -0.2, hemY - 18.0,
                -2.5, rise + 18.0));
        segments.add(curve("G", "A",
                -2.4, rise * 0.62,
                -0.7, 8.0));

        piece.set("segments", segments);
        return piece;
    }

    private ObjectNode buildBackBottomPiece(double waist, double hip, double outseam, boolean shorts) {
        double hemY = outseam;

        if (shorts) {
            double waistWidth = waist / 4.0 + 3.8;
            double hipWidth = hip / 4.0 + 6.0;
            double rise = 19.5;
            double hemWidth = hip / 8.0 + 11.8;

            ObjectNode piece = objectMapper.createObjectNode();
            piece.put("name", "back");

            ObjectNode points = objectMapper.createObjectNode();
            points.set("A", point(0.0, -1.5));
            points.set("B", point(waistWidth, 1.5));
            points.set("C", point(hipWidth, rise));
            points.set("D", point(hemWidth, hemY));
            points.set("E", point(0.0, hemY));
            points.set("F", point(-2.2, rise - 0.5));
            piece.set("points", points);

            ArrayNode segments = objectMapper.createArrayNode();
            segments.add(line("A", "B"));
            segments.add(curve("B", "C",
                    waistWidth + 1.8, rise * 0.45,
                    hipWidth + 0.4, rise * 0.92));
            segments.add(curve("C", "D",
                    hipWidth - 0.8, rise + 5.5,
                    hemWidth + 0.8, hemY * 0.55));
            segments.add(line("D", "E"));
            segments.add(curve("E", "F",
                    -0.3, hemY - 10.0,
                    -2.8, rise + 12.0));
            segments.add(curve("F", "A",
                    -2.8, rise * 0.60,
                    -0.8, 6.0));

            piece.set("segments", segments);
            return piece;
        }

        double waistWidth = waist / 4.0 + 4.2;
        double hipWidth = hip / 4.0 + 6.4;
        double rise = 27.0;
        double kneeY = outseam * 0.58;
        double hemWidth = 15.5;
        double kneeWidth = 17.0;

        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", "back");

        ObjectNode points = objectMapper.createObjectNode();
        points.set("A", point(0.0, -2.0));
        points.set("B", point(waistWidth, 1.5));
        points.set("C", point(hipWidth, rise));
        points.set("D", point(kneeWidth, kneeY));
        points.set("E", point(hemWidth, hemY));
        points.set("F", point(0.0, hemY));
        points.set("G", point(-2.4, rise - 0.5));
        piece.set("points", points);

        ArrayNode segments = objectMapper.createArrayNode();
        segments.add(line("A", "B"));
        segments.add(curve("B", "C",
                waistWidth + 2.0, rise * 0.44,
                hipWidth + 0.6, rise * 0.94));
        segments.add(curve("C", "D",
                hipWidth - 1.0, rise + 7.0,
                kneeWidth + 1.8, kneeY * 0.62));
        segments.add(line("D", "E"));
        segments.add(line("E", "F"));
        segments.add(curve("F", "G",
                -0.4, hemY - 18.0,
                -3.0, rise + 18.0));
        segments.add(curve("G", "A",
                -3.0, rise * 0.62,
                -0.9, 7.0));

        piece.set("segments", segments);
        return piece;
    }

    private GeneratedPatternResponse generateSkirtPattern(BasePattern basePattern,
                                                           Map<MeasurementCode, Double> measurementMap,
                                                           double minLength, double maxLength) {
        double waist = clamp(getMeasurementOrBase(measurementMap, MeasurementCode.WAIST, basePattern.getBaseWaist()), 58.0, 120.0);
        double hip = clamp(getMeasurementOrBase(measurementMap, MeasurementCode.HIP, basePattern.getBaseHip()), 78.0, 140.0);
        double outseam = getMeasurementOrBase(measurementMap, MeasurementCode.OUTSEAM, basePattern.getBaseOutseam());
        double hemY = clamp(outseam * 0.55, minLength, maxLength);

        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode pieces = objectMapper.createArrayNode();
        pieces.add(buildSkirtFront(waist, hip, hemY));
        pieces.add(buildSkirtBack(waist, hip, hemY));
        root.set("pieces", pieces);

        String adjustedGeometryJson;
        List<PieceMeasurementResponse> pieceMeasurements;
        try {
            adjustedGeometryJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
            pieceMeasurements = calculatePieceMeasurements(root);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate skirt pattern", e);
        }

        return GeneratedPatternResponse.builder()
                .basePatternId(basePattern.getId())
                .patternName(basePattern.getPatternName())
                .category(basePattern.getCategory().name())
                .description(basePattern.getDescription())
                .originalGeometryJson(basePattern.getGeometryJson())
                .adjustedGeometryJson(adjustedGeometryJson)
                .appliedAdjustments(List.of())
                .pieceMeasurements(pieceMeasurements)
                .build();
    }

    private GeneratedPatternResponse generatePleatedSkirtPattern(BasePattern basePattern,
                                                                  Map<MeasurementCode, Double> measurementMap,
                                                                  double targetLength) {
        double waist = clamp(getMeasurementOrBase(measurementMap, MeasurementCode.WAIST, basePattern.getBaseWaist()), 58.0, 120.0);
        double hip = clamp(getMeasurementOrBase(measurementMap, MeasurementCode.HIP, basePattern.getBaseHip()), 78.0, 140.0);
        double outseam = getMeasurementOrBase(measurementMap, MeasurementCode.OUTSEAM, basePattern.getBaseOutseam());
        double hemY = clamp(outseam * 0.55, targetLength - 8, targetLength + 8);

        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode pieces = objectMapper.createArrayNode();
        pieces.add(buildPleatedSkirtPanel(waist, hip, hemY, "front"));
        pieces.add(buildPleatedSkirtPanel(waist, hip, hemY, "back"));
        root.set("pieces", pieces);

        String adjustedGeometryJson;
        List<PieceMeasurementResponse> pieceMeasurements;
        try {
            adjustedGeometryJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
            pieceMeasurements = calculatePieceMeasurements(root);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate pleated skirt pattern", e);
        }

        return GeneratedPatternResponse.builder()
                .basePatternId(basePattern.getId())
                .patternName(basePattern.getPatternName())
                .category(basePattern.getCategory().name())
                .description(basePattern.getDescription())
                .originalGeometryJson(basePattern.getGeometryJson())
                .adjustedGeometryJson(adjustedGeometryJson)
                .appliedAdjustments(List.of())
                .pieceMeasurements(pieceMeasurements)
                .build();
    }

    private GeneratedPatternResponse generateJoggersPattern(BasePattern basePattern,
                                                             Map<MeasurementCode, Double> measurementMap) {
        double waist = clamp(getMeasurementOrBase(measurementMap, MeasurementCode.WAIST, basePattern.getBaseWaist()), 58.0, 130.0);
        double hip = clamp(getMeasurementOrBase(measurementMap, MeasurementCode.HIP, basePattern.getBaseHip()), 78.0, 145.0);
        double outseam = clamp(getMeasurementOrBase(measurementMap, MeasurementCode.OUTSEAM, basePattern.getBaseOutseam()), 90.0, 115.0);

        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode pieces = objectMapper.createArrayNode();
        pieces.add(buildJoggerFront(waist, hip, outseam));
        pieces.add(buildJoggerBack(waist, hip, outseam));
        root.set("pieces", pieces);

        String adjustedGeometryJson;
        List<PieceMeasurementResponse> pieceMeasurements;
        try {
            adjustedGeometryJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
            pieceMeasurements = calculatePieceMeasurements(root);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate joggers pattern", e);
        }

        return GeneratedPatternResponse.builder()
                .basePatternId(basePattern.getId())
                .patternName(basePattern.getPatternName())
                .category(basePattern.getCategory().name())
                .description(basePattern.getDescription())
                .originalGeometryJson(basePattern.getGeometryJson())
                .adjustedGeometryJson(adjustedGeometryJson)
                .appliedAdjustments(List.of())
                .pieceMeasurements(pieceMeasurements)
                .build();
    }

    private GeneratedPatternResponse generateLeggingsPattern(BasePattern basePattern,
                                                              Map<MeasurementCode, Double> measurementMap) {
        double waist = clamp(getMeasurementOrBase(measurementMap, MeasurementCode.WAIST, basePattern.getBaseWaist()), 58.0, 120.0);
        double hip = clamp(getMeasurementOrBase(measurementMap, MeasurementCode.HIP, basePattern.getBaseHip()), 78.0, 140.0);
        double outseam = clamp(getMeasurementOrBase(measurementMap, MeasurementCode.OUTSEAM, basePattern.getBaseOutseam()), 90.0, 115.0);

        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode pieces = objectMapper.createArrayNode();
        pieces.add(buildLeggingsFront(waist, hip, outseam));
        pieces.add(buildLeggingsBack(waist, hip, outseam));
        root.set("pieces", pieces);

        String adjustedGeometryJson;
        List<PieceMeasurementResponse> pieceMeasurements;
        try {
            adjustedGeometryJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(root);
            pieceMeasurements = calculatePieceMeasurements(root);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate leggings pattern", e);
        }

        return GeneratedPatternResponse.builder()
                .basePatternId(basePattern.getId())
                .patternName(basePattern.getPatternName())
                .category(basePattern.getCategory().name())
                .description(basePattern.getDescription())
                .originalGeometryJson(basePattern.getGeometryJson())
                .adjustedGeometryJson(adjustedGeometryJson)
                .appliedAdjustments(List.of())
                .pieceMeasurements(pieceMeasurements)
                .build();
    }

    private ObjectNode buildSkirtFront(double waist, double hip, double hemY) {
        double ww = waist / 4.0 + 1.0;
        double hw = hip / 4.0 + 2.5;
        double rise = 20.0;
        double hemFlare = hw + (hemY - rise) * 0.08;

        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", "front");
        ObjectNode pts = objectMapper.createObjectNode();
        pts.set("A", point(0.0, 0.0));
        pts.set("B", point(ww, 0.0));
        pts.set("C", point(hw, rise));
        pts.set("D", point(hemFlare, hemY));
        pts.set("E", point(0.0, hemY));
        piece.set("points", pts);

        ArrayNode segs = objectMapper.createArrayNode();
        segs.add(line("A", "B"));
        segs.add(curve("B", "C", ww + 0.5, rise * 0.4, hw - 0.3, rise * 0.85));
        segs.add(line("C", "D"));
        segs.add(line("D", "E"));
        segs.add(line("E", "A"));
        piece.set("segments", segs);
        return piece;
    }

    private ObjectNode buildSkirtBack(double waist, double hip, double hemY) {
        double ww = waist / 4.0 + 1.5;
        double hw = hip / 4.0 + 3.0;
        double rise = 21.0;
        double hemFlare = hw + (hemY - rise) * 0.08;

        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", "back");
        ObjectNode pts = objectMapper.createObjectNode();
        pts.set("A", point(0.0, 0.0));
        pts.set("B", point(ww, 0.0));
        pts.set("C", point(hw, rise));
        pts.set("D", point(hemFlare, hemY));
        pts.set("E", point(0.0, hemY));
        piece.set("points", pts);

        ArrayNode segs = objectMapper.createArrayNode();
        segs.add(line("A", "B"));
        segs.add(curve("B", "C", ww + 0.8, rise * 0.4, hw - 0.3, rise * 0.88));
        segs.add(line("C", "D"));
        segs.add(line("D", "E"));
        segs.add(line("E", "A"));
        piece.set("segments", segs);
        return piece;
    }

    private ObjectNode buildPleatedSkirtPanel(double waist, double hip, double hemY, String name) {
        double ww = waist / 4.0 + 1.0;
        double hw = hip / 4.0 + 2.5;
        double rise = 20.0;
        double hemW = hw * 1.5;

        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", name);
        ObjectNode pts = objectMapper.createObjectNode();
        pts.set("A", point(0.0, 0.0));
        pts.set("B", point(ww, 0.0));
        pts.set("C", point(hemW, hemY));
        pts.set("D", point(0.0, hemY));
        piece.set("points", pts);

        ArrayNode segs = objectMapper.createArrayNode();
        segs.add(line("A", "B"));
        segs.add(curve("B", "C", ww + (hemW - ww) * 0.3, rise, ww + (hemW - ww) * 0.7, hemY * 0.7));
        segs.add(line("C", "D"));
        segs.add(line("D", "A"));
        piece.set("segments", segs);
        return piece;
    }

    private ObjectNode buildJoggerFront(double waist, double hip, double outseam) {
        double hemY = outseam;
        double ww = waist / 4.0 + 3.0;
        double hw = hip / 4.0 + 4.8;
        double rise = 24.0;
        double kneeY = outseam * 0.58;
        double kneeW = 14.0;
        double ankleW = 9.0;

        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", "front");
        ObjectNode pts = objectMapper.createObjectNode();
        pts.set("A", point(0.0, 0.0));
        pts.set("B", point(ww, 1.0));
        pts.set("C", point(hw, rise));
        pts.set("D", point(kneeW, kneeY));
        pts.set("E", point(ankleW, hemY));
        pts.set("F", point(0.0, hemY));
        pts.set("G", point(-1.8, rise - 1.0));
        piece.set("points", pts);

        ArrayNode segs = objectMapper.createArrayNode();
        segs.add(line("A", "B"));
        segs.add(curve("B", "C", ww + 1.2, rise * 0.42, hw - 0.4, rise * 0.90));
        segs.add(curve("C", "D", hw - 0.8, rise + 6.0, kneeW + 1.4, kneeY * 0.62));
        segs.add(line("D", "E"));
        segs.add(line("E", "F"));
        segs.add(curve("F", "G", -0.2, hemY - 18.0, -2.5, rise + 18.0));
        segs.add(curve("G", "A", -2.4, rise * 0.62, -0.7, 8.0));
        piece.set("segments", segs);
        return piece;
    }

    private ObjectNode buildJoggerBack(double waist, double hip, double outseam) {
        double hemY = outseam;
        double ww = waist / 4.0 + 4.5;
        double hw = hip / 4.0 + 6.4;
        double rise = 27.0;
        double kneeY = outseam * 0.58;
        double kneeW = 15.5;
        double ankleW = 10.5;

        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", "back");
        ObjectNode pts = objectMapper.createObjectNode();
        pts.set("A", point(0.0, -2.0));
        pts.set("B", point(ww, 1.5));
        pts.set("C", point(hw, rise));
        pts.set("D", point(kneeW, kneeY));
        pts.set("E", point(ankleW, hemY));
        pts.set("F", point(0.0, hemY));
        pts.set("G", point(-2.4, rise - 0.5));
        piece.set("points", pts);

        ArrayNode segs = objectMapper.createArrayNode();
        segs.add(line("A", "B"));
        segs.add(curve("B", "C", ww + 2.0, rise * 0.44, hw + 0.6, rise * 0.94));
        segs.add(curve("C", "D", hw - 1.0, rise + 7.0, kneeW + 1.8, kneeY * 0.62));
        segs.add(line("D", "E"));
        segs.add(line("E", "F"));
        segs.add(curve("F", "G", -0.4, hemY - 18.0, -3.0, rise + 18.0));
        segs.add(curve("G", "A", -3.0, rise * 0.62, -0.9, 7.0));
        piece.set("segments", segs);
        return piece;
    }

    private ObjectNode buildLeggingsFront(double waist, double hip, double outseam) {
        double hemY = outseam;
        double ww = waist / 4.0 + 0.5;
        double hw = hip / 4.0 + 1.5;
        double rise = 22.0;
        double kneeY = outseam * 0.55;
        double kneeW = 10.0;
        double ankleW = 7.5;

        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", "front");
        ObjectNode pts = objectMapper.createObjectNode();
        pts.set("A", point(0.0, 0.0));
        pts.set("B", point(ww, 0.5));
        pts.set("C", point(hw, rise));
        pts.set("D", point(kneeW, kneeY));
        pts.set("E", point(ankleW, hemY));
        pts.set("F", point(0.0, hemY));
        pts.set("G", point(-1.2, rise - 0.5));
        piece.set("points", pts);

        ArrayNode segs = objectMapper.createArrayNode();
        segs.add(line("A", "B"));
        segs.add(curve("B", "C", ww + 0.8, rise * 0.4, hw - 0.3, rise * 0.9));
        segs.add(curve("C", "D", hw - 0.5, rise + 5.0, kneeW + 1.0, kneeY * 0.6));
        segs.add(line("D", "E"));
        segs.add(line("E", "F"));
        segs.add(curve("F", "G", -0.1, hemY - 16.0, -1.8, rise + 16.0));
        segs.add(curve("G", "A", -1.8, rise * 0.6, -0.5, 6.0));
        piece.set("segments", segs);
        return piece;
    }

    private ObjectNode buildLeggingsBack(double waist, double hip, double outseam) {
        double hemY = outseam;
        double ww = waist / 4.0 + 1.5;
        double hw = hip / 4.0 + 3.0;
        double rise = 25.0;
        double kneeY = outseam * 0.55;
        double kneeW = 11.5;
        double ankleW = 8.5;

        ObjectNode piece = objectMapper.createObjectNode();
        piece.put("name", "back");
        ObjectNode pts = objectMapper.createObjectNode();
        pts.set("A", point(0.0, -1.5));
        pts.set("B", point(ww, 1.0));
        pts.set("C", point(hw, rise));
        pts.set("D", point(kneeW, kneeY));
        pts.set("E", point(ankleW, hemY));
        pts.set("F", point(0.0, hemY));
        pts.set("G", point(-1.8, rise - 0.5));
        piece.set("points", pts);

        ArrayNode segs = objectMapper.createArrayNode();
        segs.add(line("A", "B"));
        segs.add(curve("B", "C", ww + 1.5, rise * 0.42, hw + 0.4, rise * 0.92));
        segs.add(curve("C", "D", hw - 0.8, rise + 6.0, kneeW + 1.5, kneeY * 0.62));
        segs.add(line("D", "E"));
        segs.add(line("E", "F"));
        segs.add(curve("F", "G", -0.3, hemY - 16.0, -2.2, rise + 16.0));
        segs.add(curve("G", "A", -2.2, rise * 0.6, -0.7, 6.0));
        piece.set("segments", segs);
        return piece;
    }

    private double getMeasurementOrBase(Map<MeasurementCode, Double> measurementMap,
                                        MeasurementCode code,
                                        Double baseValue) {
        Double value = measurementMap.get(code);
        if (value != null && value > 0) {
            return value;
        }
        return baseValue != null ? baseValue : 0.0;
    }

    private Double getBaseMeasurementValue(BasePattern basePattern, MeasurementCode measurementCode) {
        return switch (measurementCode) {
            case CHEST -> basePattern.getBaseChest() != null ? basePattern.getBaseChest() : 0.0;
            case SHOULDER_WIDTH -> basePattern.getBaseShoulderWidth() != null ? basePattern.getBaseShoulderWidth() : 0.0;
            case SHIRT_LENGTH -> basePattern.getBaseShirtLength() != null ? basePattern.getBaseShirtLength() : 0.0;
            case SLEEVE_LENGTH -> basePattern.getBaseSleeveLength() != null ? basePattern.getBaseSleeveLength() : 0.0;
            case WAIST -> basePattern.getBaseWaist() != null ? basePattern.getBaseWaist() : 0.0;
            case HIP -> basePattern.getBaseHip() != null ? basePattern.getBaseHip() : 0.0;
            case OUTSEAM -> basePattern.getBaseOutseam() != null ? basePattern.getBaseOutseam() : 0.0;
            case NECK -> basePattern.getBaseNeck() != null ? basePattern.getBaseNeck() : 0.0;
            case ARMHOLE_DEPTH -> basePattern.getBaseArmholeDepth() != null ? basePattern.getBaseArmholeDepth() : 0.0;
            case BICEP -> basePattern.getBaseBicep() != null ? basePattern.getBaseBicep() : 0.0;
            default -> 0.0;
        };
    }

    private boolean applyAdjustmentToGeometry(ArrayNode pieces, AdjustmentRule rule, Double adjustmentAmount) {
        for (JsonNode pieceNode : pieces) {
            ObjectNode piece = (ObjectNode) pieceNode;

            String pieceName = piece.get("name").asText();
            if (!pieceName.equalsIgnoreCase(rule.getPieceName())) {
                continue;
            }

            JsonNode pointsNode = piece.get("points");
            if (!(pointsNode instanceof ObjectNode points)) {
                return false;
            }

            JsonNode targetPointNode = points.get(rule.getTargetName());
            if (!(targetPointNode instanceof ObjectNode targetPoint)) {
                return false;
            }

            if (rule.getAxis() == Axis.X) {
                double currentX = targetPoint.get("x").asDouble();
                targetPoint.put("x", round(currentX + adjustmentAmount));
                return true;
            }

            if (rule.getAxis() == Axis.Y) {
                double currentY = targetPoint.get("y").asDouble();
                targetPoint.put("y", round(currentY + adjustmentAmount));
                return true;
            }
        }

        return false;
    }

    private ObjectNode point(double x, double y) {
        ObjectNode point = objectMapper.createObjectNode();
        point.put("x", round(x));
        point.put("y", round(y));
        return point;
    }

    private ObjectNode line(String from, String to) {
        ObjectNode seg = objectMapper.createObjectNode();
        seg.put("type", "line");
        seg.put("from", from);
        seg.put("to", to);
        return seg;
    }

    private ObjectNode curve(String from, String to,
                             double cp1x, double cp1y,
                             double cp2x, double cp2y) {
        ObjectNode seg = objectMapper.createObjectNode();
        seg.put("type", "curve");
        seg.put("from", from);
        seg.put("to", to);
        seg.set("cp1", point(cp1x, cp1y));
        seg.set("cp2", point(cp2x, cp2y));
        return seg;
    }

    private List<PieceMeasurementResponse> calculatePieceMeasurements(ObjectNode root) {
        List<PieceMeasurementResponse> result = new ArrayList<>();

        JsonNode piecesNode = root.get("pieces");
        if (!(piecesNode instanceof ArrayNode pieces)) {
            return result;
        }

        for (JsonNode pieceNode : pieces) {
            String pieceName = pieceNode.get("name").asText();
            JsonNode pointsNode = pieceNode.get("points");
            JsonNode segmentsNode = pieceNode.get("segments");

            if (!(pointsNode instanceof ObjectNode points) || !(segmentsNode instanceof ArrayNode segments)) {
                continue;
            }

            List<EdgeMeasurementResponse> edgeMeasurements = new ArrayList<>();
            double total = 0.0;

            for (JsonNode seg : segments) {
                String type = seg.get("type").asText();
                String fromKey = seg.get("from").asText();
                String toKey = seg.get("to").asText();

                JsonNode from = points.get(fromKey);
                JsonNode to = points.get(toKey);

                if (from == null || to == null) {
                    continue;
                }

                double length;

                if ("line".equalsIgnoreCase(type)) {
                    length = lineLength(from, to);
                } else if ("curve".equalsIgnoreCase(type)) {
                    JsonNode cp1 = seg.get("cp1");
                    JsonNode cp2 = seg.get("cp2");
                    if (cp1 == null || cp2 == null) {
                        continue;
                    }
                    length = cubicBezierLength(from, cp1, cp2, to, 40);
                } else {
                    continue;
                }

                total += length;

                edgeMeasurements.add(
                        EdgeMeasurementResponse.builder()
                                .label(fromKey + " → " + toKey)
                                .type(type)
                                .fromPoint(fromKey)
                                .toPoint(toKey)
                                .length(round(length))
                                .build()
                );
            }

            result.add(
                    PieceMeasurementResponse.builder()
                            .pieceName(pieceName)
                            .totalLength(round(total))
                            .edges(edgeMeasurements)
                            .build()
            );
        }

        return result;
    }

    private double lineLength(JsonNode a, JsonNode b) {
        double dx = b.get("x").asDouble() - a.get("x").asDouble();
        double dy = b.get("y").asDouble() - a.get("y").asDouble();
        return Math.sqrt(dx * dx + dy * dy);
    }

    private double cubicBezierLength(JsonNode p0, JsonNode p1, JsonNode p2, JsonNode p3, int steps) {
        double length = 0.0;

        double prevX = p0.get("x").asDouble();
        double prevY = p0.get("y").asDouble();

        for (int i = 1; i <= steps; i++) {
            double t = (double) i / steps;

            double x = cubicBezier(
                    p0.get("x").asDouble(),
                    p1.get("x").asDouble(),
                    p2.get("x").asDouble(),
                    p3.get("x").asDouble(),
                    t
            );

            double y = cubicBezier(
                    p0.get("y").asDouble(),
                    p1.get("y").asDouble(),
                    p2.get("y").asDouble(),
                    p3.get("y").asDouble(),
                    t
            );

            double dx = x - prevX;
            double dy = y - prevY;
            length += Math.sqrt(dx * dx + dy * dy);

            prevX = x;
            prevY = y;
        }

        return length;
    }

    private double cubicBezier(double p0, double p1, double p2, double p3, double t) {
        double oneMinusT = 1 - t;
        return Math.pow(oneMinusT, 3) * p0
                + 3 * Math.pow(oneMinusT, 2) * t * p1
                + 3 * oneMinusT * t * t * p2
                + t * t * t * p3;
    }

    private double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private BasePatternResponse mapBasePatternResponse(BasePattern pattern) {
        return BasePatternResponse.builder()
                .id(pattern.getId())
                .patternName(pattern.getPatternName())
                .category(pattern.getCategory())
                .baseChest(pattern.getBaseChest())
                .baseShoulderWidth(pattern.getBaseShoulderWidth())
                .baseShirtLength(pattern.getBaseShirtLength())
                .baseSleeveLength(pattern.getBaseSleeveLength())
                .baseWaist(pattern.getBaseWaist())
                .baseHip(pattern.getBaseHip())
                .baseOutseam(pattern.getBaseOutseam())
                .baseNeck(pattern.getBaseNeck())
                .baseArmholeDepth(pattern.getBaseArmholeDepth())
                .baseBicep(pattern.getBaseBicep())
                .description(pattern.getDescription())
                .geometryJson(pattern.getGeometryJson())
                .useCount(pattern.getUseCount() != null ? pattern.getUseCount() : 0L)
                .build();
    }

    public BasePatternResponse trackUse(Long patternId) {
        BasePattern pattern = basePatternRepository.findById(patternId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Pattern not found"));
        pattern.setUseCount(pattern.getUseCount() == null ? 1L : pattern.getUseCount() + 1);
        return mapBasePatternResponse(basePatternRepository.save(pattern));
    }

    private UserPatternSelectionResponse mapSelectionResponse(UserPatternSelection selection) {
        return UserPatternSelectionResponse.builder()
                .selectionId(selection.getId())
                .basePatternId(selection.getBasePattern().getId())
                .patternName(selection.getBasePattern().getPatternName())
                .category(selection.getBasePattern().getCategory().name())
                .description(selection.getBasePattern().getDescription())
                .build();
    }
}