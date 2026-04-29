const StudentLearningProfile = require('../models/StudentLearningProfile');

class PersonalizationService {
  async getOrCreateProfile(userId) {
    let profile = await StudentLearningProfile.findOne({ userId });
    if (!profile) {
      profile = await StudentLearningProfile.create({ userId });
    }
    return profile;
  }

  async updateWeakTopic(userId, topicName, failed) {
    const profile = await this.getOrCreateProfile(userId);
    
    // Check if topic exists in weakTopics
    const weakTopicIndex = profile.weakTopics.findIndex(t => t.topic.toLowerCase() === topicName.toLowerCase());
    
    if (failed) {
      if (weakTopicIndex > -1) {
        profile.weakTopics[weakTopicIndex].weight += 1;
        profile.weakTopics[weakTopicIndex].lastFailedAt = Date.now();
      } else {
        profile.weakTopics.push({
          topic: topicName,
          weight: 1,
          lastFailedAt: Date.now()
        });
      }
    } else {
      // If student got it right, maybe decrease weak weight or add to strong
      if (weakTopicIndex > -1) {
        profile.weakTopics[weakTopicIndex].weight -= 0.5;
        if (profile.weakTopics[weakTopicIndex].weight <= 0) {
          profile.weakTopics.splice(weakTopicIndex, 1); // Removed from weak topics
        }
      }
      
      const strongTopicIndex = profile.strongTopics.findIndex(t => t.topic.toLowerCase() === topicName.toLowerCase());
      if (strongTopicIndex > -1) {
        profile.strongTopics[strongTopicIndex].weight += 0.5;
      } else {
        profile.strongTopics.push({
          topic: topicName,
          weight: 1
        });
      }
    }

    profile.lastPracticedAt = Date.now();
    await profile.save();
  }

  async getContextString(userId) {
    const profile = await StudentLearningProfile.findOne({ userId });
    if (!profile || profile.weakTopics.length === 0) return '';

    // Sort weak topics by weight descending
    const topWeakTopics = profile.weakTopics
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(t => t.topic)
      .join(', ');

    return `\n[Student Profile Info]
The student asking this question has recently struggled with these topics: ${topWeakTopics}.
If your explanation touches on these areas, please be extra gentle and provide extremely clear, simple step-by-step examples.`;
  }
}

module.exports = new PersonalizationService();
