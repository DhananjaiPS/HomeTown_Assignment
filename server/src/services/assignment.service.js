const Assignment = require('../models/Assignment');
const Article = require('../models/Article');
const Submission = require('../models/Submission');

class AssignmentService {
  async getAllAssignmentsAdmin() {
    // Populate articleId to get the title
    const assignments = await Assignment.find()
      .populate('articleId', 'title')
      .sort({ createdAt: -1 });
    return assignments;
  }

  async getAssignmentById(id) {
    const assignment = await Assignment.findById(id).populate('articleId', 'title');
    if (!assignment) {
      throw new Error('Assignment not found');
    }
    return assignment;
  }

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
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Check for existing submissions
    const submissionCount = await Submission.countDocuments({ assignmentId: id });
    
    if (submissionCount > 0) {
      // Soft delete / archive
      assignment.status = 'inactive';
      await assignment.save();
      return { message: 'Assignment archived because it has existing submissions', assignment };
    } else {
      // Hard delete
      await Assignment.findByIdAndDelete(id);
      return { message: 'Assignment deleted permanently' };
    }
  }
}

module.exports = new AssignmentService();
