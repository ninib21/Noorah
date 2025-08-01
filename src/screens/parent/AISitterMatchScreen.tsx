import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { aiService, AISitterMatchRequest, AISitterMatchResponse } from '../../services/ai.service';
import Button from '../../components/Button';
import Card from '../../components/Card';

const { width } = Dimensions.get('window');

interface AISitterMatchScreenProps {
  route: {
    params: {
      childId: string;
      childName: string;
    };
  };
}

const AISitterMatchScreen: React.FC<AISitterMatchScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { childId, childName } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<AISitterMatchResponse[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<AISitterMatchResponse | null>(null);

  // Mock preferences - in real app, these would come from user settings
  const [preferences] = useState<AISitterMatchRequest['parentPreferences']>({
    budget: { min: 15, max: 50 },
    location: { latitude: 40.7128, longitude: -74.0060, maxDistance: 15 },
    schedule: { 
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '21:00',
      duration: 3,
    },
    requirements: {
      languages: ['English'],
      skills: ['CPR', 'First Aid'],
      experience: 2,
      verified: true,
      backgroundCheck: true,
    },
    priorities: {
      safety: 9,
      experience: 7,
      cost: 6,
      availability: 8,
      personality: 7,
    },
    urgency: 'medium',
  });

  useEffect(() => {
    findMatches();
  }, []);

  const findMatches = async () => {
    try {
      setLoading(true);
      const request: AISitterMatchRequest = {
        childId,
        parentPreferences: preferences,
        limit: 10,
      };

      const results = await aiService.findSitterMatches(request);
      setMatches(results);
    } catch (error) {
      console.error('Error finding matches:', error);
      Alert.alert('Error', 'Failed to find sitter matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSitter = (match: AISitterMatchResponse) => {
    setSelectedMatch(match);
    Alert.alert(
      'Select Sitter',
      `Would you like to book ${match.sitterInfo.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => {
            // Navigate to booking screen with selected sitter
            navigation.navigate('ParentBook' as never, {
              sitterId: match.sitterId,
              sitterName: match.sitterInfo.name,
              childId,
              childName,
            } as never);
          }
        },
      ]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#8BC34A';
    if (score >= 70) return '#FFC107';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const renderMatchCard = (match: AISitterMatchResponse, index: number) => (
    <Card key={match.sitterId} variant="elevated" style={styles.matchCard}>
      <View style={styles.matchHeader}>
        <View style={styles.sitterInfo}>
          <Text style={styles.sitterName}>{match.sitterInfo.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{match.sitterInfo.rating}</Text>
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, { backgroundColor: getScoreColor(match.overallScore) }]}>
            <Text style={styles.scoreText}>{Math.round(match.overallScore)}</Text>
          </View>
          <Text style={styles.scoreLabel}>Match</Text>
        </View>
      </View>

      <View style={styles.matchDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.detailText}>{match.distance.toFixed(1)} km away</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.detailText}>${match.sitterInfo.hourlyRate}/hr</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="briefcase" size={16} color="#666" />
          <Text style={styles.detailText}>{match.sitterInfo.experience} years experience</Text>
        </View>
      </View>

      {match.reasons.length > 0 && (
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsTitle}>Why this match works:</Text>
          {match.reasons.slice(0, 2).map((reason, idx) => (
            <View key={idx} style={styles.reasonItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      )}

      {match.warnings.length > 0 && (
        <View style={styles.warningsContainer}>
          <Text style={styles.warningsTitle}>Consider:</Text>
          {match.warnings.slice(0, 1).map((warning, idx) => (
            <View key={idx} style={styles.warningItem}>
              <Ionicons name="warning" size={16} color="#FF9800" />
              <Text style={styles.warningText}>{warning}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.matchActions}>
        <Button
          title="View Profile"
          variant="outline"
          size="small"
          onPress={() => {
            navigation.navigate('SitterProfile' as never, { sitterId: match.sitterId } as never);
          }}
          style={styles.actionButton}
        />
        <Button
          title="Book Now"
          variant="primary"
          size="small"
          onPress={() => handleSelectSitter(match)}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#3A7DFF', '#FF7DB9']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Finding the perfect sitter for {childName}...</Text>
            <Text style={styles.loadingSubtext}>Our AI is analyzing compatibility, availability, and preferences</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#3A7DFF', '#FF7DB9']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>AI Sitter Match</Text>
            <Text style={styles.headerSubtitle}>Perfect matches for {childName}</Text>
          </View>
          <TouchableOpacity onPress={findMatches} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Preferences Summary */}
          <Card variant="outlined" style={styles.preferencesCard}>
            <Text style={styles.preferencesTitle}>Your Preferences</Text>
            <View style={styles.preferencesGrid}>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Budget</Text>
                <Text style={styles.preferenceValue}>${preferences.budget.min}-${preferences.budget.max}/hr</Text>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Distance</Text>
                <Text style={styles.preferenceValue}>{preferences.location.maxDistance} km</Text>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Experience</Text>
                <Text style={styles.preferenceValue}>{preferences.requirements.experience}+ years</Text>
              </View>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Priority</Text>
                <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(preferences.urgency) }]}>
                  <Text style={styles.urgencyText}>{preferences.urgency}</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Results Summary */}
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>
              {matches.length} Perfect Matches Found
            </Text>
            <Text style={styles.resultsSubtitle}>
              Ranked by AI compatibility score
            </Text>
          </View>

          {/* Matches */}
          {matches.map((match, index) => renderMatchCard(match, index))}

          {/* No matches */}
          {matches.length === 0 && !loading && (
            <Card variant="outlined" style={styles.noMatchesCard}>
              <Ionicons name="search" size={48} color="#999" />
              <Text style={styles.noMatchesTitle}>No matches found</Text>
              <Text style={styles.noMatchesText}>
                Try adjusting your preferences or expanding your search area
              </Text>
              <Button
                title="Adjust Preferences"
                variant="primary"
                onPress={() => {
                  // Navigate to preferences screen
                  navigation.navigate('Preferences' as never);
                }}
                style={styles.adjustButton}
              />
            </Card>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💡 AI matching considers temperament, experience, availability, and your preferences
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 10,
    textAlign: 'center',
  },
  preferencesCard: {
    marginBottom: 20,
  },
  preferencesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  preferenceItem: {
    width: '48%',
    marginBottom: 10,
  },
  preferenceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  urgencyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  resultsHeader: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  matchCard: {
    marginBottom: 15,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sitterInfo: {
    flex: 1,
  },
  sitterName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  matchDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  reasonsContainer: {
    marginBottom: 10,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    color: '#4CAF50',
    marginLeft: 6,
  },
  warningsContainer: {
    marginBottom: 15,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#FF9800',
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: '#FF9800',
    marginLeft: 6,
  },
  matchActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  noMatchesCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noMatchesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  noMatchesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  adjustButton: {
    width: 200,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default AISitterMatchScreen; 