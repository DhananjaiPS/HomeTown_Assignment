const Assignment = require('../models/Assignment');
const Article = require('../models/Article');

class AssignmentService {
  async getAssignmentByArticle(articleId) {
    const assignment = await Assignment.findOne({ articleId, status: 'active' });
    return assignment;
  }

  async createAssignment(data) {
    const article = await Article.findById(data.articleId);
    if (!article) {
      throw new Error('Article not found');
    }
    
    // Check if assignment already exists for this article
    const exists = await Assignment.findOne({ articleId: data.articleId });
    if (exists) {
      throw new Error('Assignment already exists for this article');
    }

    return await Assignment.create(data);
  }

  async updateAssignment(id, data) {
    const assignment = await Assignment.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    return assignment;
  }

  async deleteAssignment(id) {
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    return assignment;
  }
}

module.exports = new AssignmentService();
