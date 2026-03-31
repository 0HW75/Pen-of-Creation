import { useCallback } from 'react';
import { message } from 'antd';
import { characterApi, locationApi, factionApi, itemApi, settingApi, worldSettingApi, societyApi, historyTimelineApi } from '../../services/api';

export const useSaveElements = (projectId) => {
  const inferElementType = useCallback((elementName, elementData) => {
    const name = (elementName || '').toLowerCase();
    const type = (elementData?.type || '').toLowerCase();
    
    console.log('推断元素类型:', { name, type, elementData });

    if (type.includes('character')) return 'character';
    if (type.includes('location')) return 'location';
    if (type.includes('faction')) return 'faction';
    if (type.includes('item')) return 'item';
    if (type.includes('energy')) return 'energy_system';
    
    if (name.includes('角色') || name.includes('人物') || name.includes('主角') || name.includes('配角')) {
      return 'character';
    }
    if (name.includes('地点') || name.includes('场景') || name.includes('城市') || name.includes('建筑')) {
      return 'location';
    }
    if (name.includes('组织') || name.includes('势力') || name.includes('门派') || name.includes('家族')) {
      return 'faction';
    }
    if (name.includes('物品') || name.includes('道具') || name.includes('武器') || name.includes('法宝')) {
      return 'item';
    }
    if (name.includes('能量') || name.includes('体系') || name.includes('修炼') || name.includes('功法') || name.includes('等级')) {
      return 'energy_system';
    }
    if (name.includes('世界') || name.includes('维度') || name.includes('位面') || name.includes('宇宙') || name.includes('空间')) {
      return 'world_architecture';
    }

    if (elementData?.abilities || elementData?.personality || elementData?.background || 
        elementData?.age || elementData?.appearance || elementData?.ability_levels ||
        elementData?.gender || elementData?.role_in_story) {
      return 'character';
    }
    if (elementData?.geography || elementData?.climate || elementData?.terrain ||
        elementData?.location_type || elementData?.geographical_coordinates) {
      return 'location';
    }
    if (elementData?.ideology || elementData?.structure || elementData?.members ||
        elementData?.faction_type || elementData?.influence) {
      return 'faction';
    }
    if (elementData?.energy_type || elementData?.power_levels || elementData?.cultivation_system ||
        elementData?.energy_source || elementData?.acquisition_method) {
      return 'energy_system';
    }
    if (elementData?.civilization_type || elementData?.development_level || elementData?.population_scale ||
        elementData?.political_system || elementData?.technological_level) {
      return 'civilization';
    }
    if (elementData?.event_type || elementData?.start_year || elementData?.end_year ||
        elementData?.historical_significance || elementData?.primary_causes) {
      return 'historical_event';
    }
    if (elementData?.dimension_type || elementData?.entry_conditions || elementData?.time_flow ||
        elementData?.spatial_hierarchy) {
      return 'dimension';
    }

    console.log('无法确定类型，使用默认类型 item');
    return 'item';
  }, []);

  const saveGeneratedElements = useCallback(async (resultsToSave, worldId) => {
    console.log('saveGeneratedElements 被调用');
    console.log('allGeneratedResults (from ref):', resultsToSave);
    console.log('allGeneratedResults 长度:', resultsToSave?.length);
    
    if (!resultsToSave || resultsToSave.length === 0) {
      console.log('没有生成的设定元素需要保存');
      message.warning('没有生成的设定元素需要保存');
      return { savedCount: 0, failedCount: 0 };
    }

    console.log('开始保存生成的设定元素，数量:', resultsToSave.length);
    message.loading('正在保存设定元素...', 0);
    let savedCount = 0;
    let failedCount = 0;

    try {
      for (const result of resultsToSave) {
        console.log('处理元素:', result);
        
        if (!result.success || !result.data) {
          console.log('跳过无效结果:', result);
          continue;
        }

        try {
          const elementData = result.data;
          const elementName = result.element_name || elementData?.name || '未命名';
          const sourceChapters = result.sources || (result.source_chapter ? [result.source_chapter] : []);
          
          let elementType = result.element_type;

          if (!elementType) {
            const elementId = result.element_id || '';
            
            if (elementId.includes('energy') || elementId.includes('system')) {
              elementType = 'energy_system';
            } else if (elementId.includes('char')) {
              elementType = 'character';
            } else if (elementId.includes('loc')) {
              elementType = 'location';
            } else if (elementId.includes('faction') || elementId.includes('fac_')) {
              elementType = 'faction';
            } else if (elementId.includes('item') || elementId.includes('itm_')) {
              elementType = 'item';
            } else if (elementId.includes('world') || elementId.includes('arch') || elementId.includes('dim_')) {
              elementType = 'world_architecture';
            } else if (elementId.includes('civilization') || elementId.includes('civ_')) {
              elementType = 'civilization';
            } else if (elementId.includes('historical') || elementId.includes('event') || elementId.includes('evt_') || elementId.includes('hist_')) {
              elementType = 'historical_event';
            } else if (elementId.includes('dimension') || elementId.includes('dim_')) {
              elementType = 'dimension';
            } else {
              elementType = inferElementType(elementName, elementData);
            }
          }
          
          console.log(`[saveGeneratedElements] 最终元素类型: name=${elementName}, type=${elementType}, id=${result.element_id}`);
          console.log('元素数据:', elementData);

          switch (elementType) {
            case 'character':
              await characterApi.createCharacter({
                project_id: projectId,
                world_id: worldId,
                name: elementData.name || elementName,
                description: elementData.description || '',
                character_type: elementData.character_type || elementData.role_type || '配角',
                role_type: elementData.role_type || elementData.character_type || '配角',
                status: elementData.status || '存活',
                importance_level: elementData.importance_level || 5,
                race: elementData.race || '',
                gender: elementData.gender || '',
                age: elementData.age || 0,
                birth_date: elementData.birth_date || '',
                appearance: elementData.appearance || '',
                appearance_age: elementData.appearance_age || elementData.age || 0,
                distinguishing_features: elementData.distinguishing_features || '',
                personality: elementData.personality || '',
                core_traits: elementData.core_traits || '',
                psychological_fear: elementData.psychological_fear || '',
                values: elementData.values || '',
                psychological_trauma: elementData.psychological_trauma || '',
                background: elementData.background || '',
                birthplace: elementData.birthplace || '',
                nationality: elementData.nationality || '',
                family_background: elementData.family_background || '',
                occupation: elementData.occupation || elementData.profession || '',
                faction: elementData.faction || elementData.affiliation || '',
                current_location: elementData.current_location || '',
                ability_levels: elementData.ability_levels || '',
                ability_limits: elementData.ability_limits || '',
                special_abilities: elementData.special_abilities || elementData.abilities || '',
                physical_abilities: elementData.physical_abilities || '',
                intelligence_perception: elementData.intelligence_perception || '',
                special_talents: elementData.special_talents || '',
                character_arc: elementData.character_arc || '',
                motivation: elementData.motivation || '',
                secrets: elementData.secrets || '',
                growth_experience: elementData.growth_experience || '',
                important_turning_points: elementData.important_turning_points || '',
                source_chapters: sourceChapters,
              });
              savedCount++;
              console.log('角色保存成功:', elementName);
              break;

            case 'location':
              await locationApi.createLocation({
                project_id: projectId,
                world_id: worldId,
                name: elementData.name || elementName,
                description: elementData.description || '',
                location_type: elementData.location_type || '其他',
                region: elementData.region || '',
                geographical_location: elementData.geographical_location || '',
                terrain: elementData.terrain || '',
                climate: elementData.climate || '',
                special_environment: elementData.special_environment || '',
                controlling_faction: elementData.controlling_faction || '',
                population_composition: elementData.population_composition || '',
                economic_status: elementData.economic_status || '',
                cultural_features: elementData.cultural_features || '',
                overall_layout: elementData.overall_layout || '',
                functional_areas: elementData.functional_areas || '',
                key_buildings: elementData.key_buildings || '',
                secret_areas: elementData.secret_areas || '',
                defense_facilities: elementData.defense_facilities || '',
                guard_force: elementData.guard_force || '',
                defense_weaknesses: elementData.defense_weaknesses || '',
                emergency_plans: elementData.emergency_plans || '',
                main_resources: elementData.main_resources || '',
                potential_dangers: elementData.potential_dangers || '',
                access_restrictions: elementData.access_restrictions || '',
                survival_conditions: elementData.survival_conditions || '',
                importance: elementData.importance || 5,
                source_chapters: sourceChapters,
              });
              savedCount++;
              console.log('地点保存成功:', elementName);
              break;

            case 'faction':
              await factionApi.createFaction({
                project_id: projectId,
                world_id: worldId,
                name: elementData.name || elementName,
                description: elementData.description || '',
                faction_type: elementData.faction_type || '其他',
                faction_status: elementData.faction_status || '',
                core_ideology: elementData.core_ideology || '',
                sphere_of_influence: elementData.sphere_of_influence || '',
                influence_level: elementData.influence_level || '',
                establishment_time: elementData.establishment_time || '',
                member_size: elementData.member_size || '',
                headquarters_location: elementData.headquarters_location || '',
                economic_strength: elementData.economic_strength || '',
                leadership_system: elementData.leadership_system || '',
                hierarchy: elementData.hierarchy || '',
                department_setup: elementData.department_setup || '',
                decision_mechanism: elementData.decision_mechanism || '',
                leader: elementData.leader || '',
                key_members: elementData.key_members || '',
                talent_reserve: elementData.talent_reserve || '',
                defectors: elementData.defectors || '',
                recruitment_method: elementData.recruitment_method || '',
                training_system: elementData.training_system || '',
                disciplinary_rules: elementData.disciplinary_rules || '',
                promotion_path: elementData.promotion_path || '',
                special_abilities: elementData.special_abilities || '',
                heritage_system: elementData.heritage_system || '',
                resource_reserves: elementData.resource_reserves || '',
                intelligence_network: elementData.intelligence_network || '',
                short_term_goals: elementData.short_term_goals || '',
                medium_term_plans: elementData.medium_term_plans || '',
                long_term_vision: elementData.long_term_vision || '',
                secret_plans: elementData.secret_plans || '',
                ally_relationships: elementData.ally_relationships || '',
                enemy_relationships: elementData.enemy_relationships || '',
                subordinate_relationships: elementData.subordinate_relationships || '',
                neutral_relationships: elementData.neutral_relationships || '',
                ideology: elementData.ideology || elementData.core_ideology || '',
                structure: elementData.structure || elementData.hierarchy || '',
                influence: elementData.influence || elementData.sphere_of_influence || '',
                source_chapters: sourceChapters,
              });
              savedCount++;
              console.log('组织保存成功:', elementName);
              break;

            case 'item':
              await itemApi.createItem({
                project_id: projectId,
                world_id: worldId,
                name: elementData.name || elementName,
                description: elementData.description || '',
                item_type: elementData.item_type || '其他',
                rarity_level: elementData.rarity_level || '普通',
                physical_properties: elementData.physical_properties || '',
                special_effects: elementData.special_effects || '',
                usage_requirements: elementData.usage_requirements || '',
                durability: elementData.durability || 100,
                creator: elementData.creator || '',
                source: elementData.source || '',
                historical_heritage: elementData.historical_heritage || '',
                current_owner: elementData.current_owner || '',
                acquisition_method: elementData.acquisition_method || '',
                importance: elementData.importance || '',
                properties: elementData.properties || elementData.physical_properties || '',
                origin: elementData.origin || elementData.source || '',
                significance: elementData.significance || elementData.importance || '',
                source_chapters: sourceChapters,
              });
              savedCount++;
              console.log('物品保存成功:', elementName);
              break;

            case 'energy_system':
              try {
                await settingApi.createEnergySystem({
                  world_id: worldId,
                  name: elementData.name || elementName,
                  energy_type: elementData.energy_type || elementData.type || '魔法',
                  description: elementData.description || elementData.overview || '',
                  source: elementData.source || '',
                  acquisition_method: elementData.acquisition_method || '',
                  storage_method: elementData.storage_method || '',
                  usage_limitations: elementData.usage_limitations || elementData.basic_laws || '',
                  common_applications: elementData.common_applications || '',
                  rarity: elementData.rarity || '常见',
                  stability: elementData.stability || '稳定',
                  interaction_with_other_energies: elementData.interaction_with_other_energies || '',
                  cultivation_method: elementData.cultivation_method || elementData.advancement_paths || '',
                  typical_manifestations: elementData.typical_manifestations || '',
                });
                savedCount++;
                console.log('能量体系保存成功:', elementName);
              } catch (energyError) {
                console.error('能量体系保存失败，尝试使用物品API:', energyError);
                await itemApi.createItem({
                  project_id: projectId,
                  world_id: worldId,
                  name: elementData.name || elementName,
                  description: elementData.description || '',
                  item_type: '能量体系',
                  properties: JSON.stringify(elementData),
                  origin: 'AI生成',
                  significance: elementData.significance || '核心设定',
                });
                savedCount++;
              }
              break;

            case 'world_architecture':
              const architectureType = elementData.architecture_type || '';
              console.log(`保存世界架构: ${elementName}, 类型: ${architectureType}`);
              
              try {
                if (architectureType.includes('维度') || architectureType.includes('位面')) {
                  await worldSettingApi.createDimension({
                    world_id: worldId,
                    name: elementData.name || elementName,
                    dimension_type: elementData.dimension_type || '位面',
                    description: elementData.description || '',
                    entry_conditions: elementData.entry_conditions || '',
                    physical_properties: elementData.physical_properties || '',
                    time_flow: elementData.time_flow || '',
                    special_rules: elementData.special_rules || '',
                  });
                  console.log('维度保存成功:', elementName);
                } else if (architectureType.includes('区域') || architectureType.includes('地理')) {
                  await worldSettingApi.createRegion({
                    world_id: worldId,
                    name: elementData.name || elementName,
                    region_type: elementData.region_type || '区域',
                    description: elementData.description || '',
                    climate: elementData.climate || '',
                    terrain: elementData.terrain || '',
                    geographical_coordinates: elementData.geographical_coordinates || '',
                  });
                  console.log('区域保存成功:', elementName);
                } else if (architectureType.includes('天体')) {
                  await worldSettingApi.createCelestialBody({
                    world_id: worldId,
                    name: elementData.name || elementName,
                    celestial_type: elementData.celestial_type || '行星',
                    description: elementData.description || '',
                    position: elementData.position || '',
                    size: elementData.size || '',
                    characteristics: elementData.characteristics || '',
                  });
                  console.log('天体保存成功:', elementName);
                } else if (architectureType.includes('法则') || architectureType.includes('规则')) {
                  await worldSettingApi.createNaturalLaw({
                    world_id: worldId,
                    name: elementData.name || elementName,
                    law_type: elementData.law_type || '物理法则',
                    description: elementData.description || '',
                    effects: elementData.effects || '',
                    exceptions: elementData.exceptions || '',
                  });
                  console.log('自然法则保存成功:', elementName);
                } else {
                  await worldSettingApi.createDimension({
                    world_id: worldId,
                    name: elementData.name || elementName,
                    dimension_type: elementData.dimension_type || '位面',
                    description: elementData.description || '',
                    entry_conditions: elementData.entry_conditions || '',
                    physical_properties: elementData.physical_properties || '',
                    time_flow: elementData.time_flow || '',
                    special_rules: elementData.special_rules || '',
                  });
                  console.log('世界架构(默认维度)保存成功:', elementName);
                }
                savedCount++;
              } catch (archError) {
                console.error('世界架构保存失败，尝试使用物品API:', archError);
                await itemApi.createItem({
                  project_id: projectId,
                  world_id: worldId,
                  name: elementData.name || elementName,
                  description: elementData.description || '',
                  item_type: '世界架构',
                  properties: JSON.stringify(elementData),
                  origin: 'AI生成',
                  significance: elementData.significance || '核心设定',
                });
                savedCount++;
              }
              break;

            case 'civilization':
              try {
                await societyApi.createCivilization({
                  world_id: worldId,
                  name: elementData.name || elementName,
                  civilization_type: elementData.civilization_type || '其他',
                  description: elementData.description || '',
                  development_level: elementData.development_level || elementData.development_stage || '',
                  population_scale: elementData.population_scale || '',
                  territory_size: elementData.territory_size || '',
                  political_system: elementData.political_system || '',
                  economic_system: elementData.economic_system || '',
                  technological_level: elementData.technological_level || '',
                  magical_level: elementData.magical_level || '',
                  cultural_characteristics: elementData.cultural_characteristics || '',
                  religious_beliefs: elementData.religious_beliefs || '',
                  taboos: elementData.taboos || '',
                  values: elementData.values || '',
                  historical_origin: elementData.historical_origin || '',
                  importance_level: elementData.importance_level || elementData.importance || 5,
                });
                savedCount++;
                console.log('文明保存成功:', elementName);
              } catch (civError) {
                console.error('文明保存失败:', civError);
                await itemApi.createItem({
                  project_id: projectId,
                  world_id: worldId,
                  name: elementData.name || elementName,
                  description: elementData.description || '',
                  item_type: '文明体系',
                  properties: JSON.stringify(elementData),
                  origin: 'AI生成',
                  significance: elementData.importance || '核心设定',
                });
                savedCount++;
              }
              break;

            case 'historical_event':
              try {
                await historyTimelineApi.createHistoricalEvent({
                  world_id: worldId,
                  name: elementData.name || elementName,
                  event_type: elementData.event_type || '其他',
                  description: elementData.description || '',
                  start_year: elementData.start_year || '',
                  end_year: elementData.end_year || '',
                  primary_causes: elementData.primary_causes || '',
                  key_participants: elementData.key_participants || '',
                  event_sequence: elementData.event_sequence || '',
                  immediate_outcomes: elementData.immediate_outcomes || '',
                  long_term_consequences: elementData.long_term_consequences || '',
                  historical_significance: elementData.historical_significance || '',
                  importance_level: elementData.importance_level || elementData.importance || 5,
                });
                savedCount++;
                console.log('历史事件保存成功:', elementName);
              } catch (eventError) {
                console.error('历史事件保存失败:', eventError);
                await itemApi.createItem({
                  project_id: projectId,
                  world_id: worldId,
                  name: elementData.name || elementName,
                  description: elementData.description || '',
                  item_type: '历史事件',
                  properties: JSON.stringify(elementData),
                  origin: 'AI生成',
                  significance: elementData.importance_level || elementData.importance || '核心设定',
                });
                savedCount++;
              }
              break;

            case 'dimension':
              try {
                await worldSettingApi.createDimension({
                  world_id: worldId,
                  name: elementData.name || elementName,
                  dimension_type: elementData.dimension_type || '位面',
                  description: elementData.description || '',
                  entry_conditions: elementData.entry_conditions || '',
                  physical_properties: elementData.physical_properties || '',
                  time_flow: elementData.time_flow || '',
                  spatial_hierarchy: elementData.spatial_hierarchy || '',
                  special_rules: elementData.special_rules || '',
                  magic_concentration: elementData.magic_concentration || '',
                  element_activity: elementData.element_activity || '',
                  gravity: elementData.gravity || '',
                });
                savedCount++;
                console.log('维度保存成功:', elementName);
              } catch (dimError) {
                console.error('维度保存失败:', dimError);
                await itemApi.createItem({
                  project_id: projectId,
                  world_id: worldId,
                  name: elementData.name || elementName,
                  description: elementData.description || '',
                  item_type: '维度/位面',
                  properties: JSON.stringify(elementData),
                  origin: 'AI生成',
                  significance: '核心设定',
                });
                savedCount++;
              }
              break;

            default:
              console.log(`未处理的元素类型: ${elementType}`, elementData);
              failedCount++;
              break;
          }
        } catch (saveError) {
          console.error(`保存元素失败: ${result.element_name}`, saveError);
          console.error('详细错误信息:', saveError.response?.data || saveError.message);
          failedCount++;
        }
      }

      if (savedCount > 0) {
        message.success(`成功保存 ${savedCount} 个设定元素${failedCount > 0 ? `，${failedCount} 个失败` : ''}`);
      }
      return { savedCount, failedCount };
    } catch (error) {
      console.error('保存设定元素失败:', error);
      message.error('保存设定元素失败');
      return { savedCount, failedCount };
    } finally {
      message.destroy();
    }
  }, [projectId, inferElementType]);

  return {
    saveGeneratedElements,
    inferElementType,
  };
};