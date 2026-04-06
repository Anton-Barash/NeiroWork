// Data types definitions
export const ChatType = {
  id: Number,
  topic: String,
  custom_prompt: String,
  company_id: Number,
  created_at: Date
};

export const MessageType = {
  id: Number,
  chat_id: Number,
  parent_id: Number,
  user_id: Number,
  content: String,
  role: String,
  created_at: Date
};

export const FileType = {
  id: Number,
  chat_id: Number,
  filename: String,
  filepath: String,
  size: Number,
  type: String,
  created_at: Date
};

export const CompanyType = {
  id: Number,
  name: String,
  description: String,
  code: String,
  unique_id: String,
  created_by: Number,
  created_at: Date,
  updated_at: Date
};

export const UserType = {
  id: Number,
  username: String,
  password: String,
  email: String,
  created_at: Date
};

export const AnalysisType = {
  id: Number,
  chat_id: Number,
  analysis_text: String,
  created_at: Date,
  has_new_messages: Boolean
};

export const PromptSettingsType = {
  id: Number,
  chat_id: Number,
  dialog_analysis_prompt: String,
  neirowork_prompt: String,
  created_at: Date,
  updated_at: Date
};
