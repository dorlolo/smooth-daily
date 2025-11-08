export type Locale = 'en' | 'zh';

type Dict = Record<string, string>;

const en: Dict = {
  // headings
  'title.dailyNotes': 'Daily notes',
  'section.dailyTemplate': 'Daily template',
  'section.weeklyTemplate': 'Weekly template',
  'section.projectTemplate': 'Project template',
  'section.meetingTemplate': 'Meeting template',

  // folder fields
  'field.dailyFolder.name': 'Daily folder path',
  'field.dailyFolder.desc': 'Storage location of daily notes',
  'field.weeklyFolder.name': 'Weekly folder path',
  'field.weeklyFolder.desc': 'Storage location of weekly notes',
  'field.projectFolder.name': 'Project folder path',
  'field.projectFolder.desc': 'Storage location of project notes',
  'field.meetingFolder.name': 'Meeting folder path',
  'field.meetingFolder.desc': 'Storage location of meeting notes',

  // auto create
  'field.autoCreate.name': 'Auto-create daily notes',
  'field.autoCreate.desc': 'Create daily note automatically on first launch each day',

  // language field
  'field.language.name': 'Language',
  'field.language.desc': 'Plugin language',
  'language.option.zh': 'Chinese',
  'language.option.en': 'English',

  // reset
  'field.reset.name': 'Reset to defaults',
  'field.reset.desc': 'Restore all settings to initial values',
  'field.reset.button': 'Reset to defaults',

  // placeholders
  'placeholder.dailyFolder': 'Workflow/daily',
  'placeholder.weeklyFolder': 'Workflow/weekly',
  'placeholder.projectFolder': 'Workflow/projects',
  'placeholder.meetingFolder': 'Workflow/meetings',
  // commands
  'command.createDaily.name': "Create or open today's daily note",
  'command.createWeekly.name': 'Create or open weekly note',
  'command.createProject.name': 'Create project',
  'command.createMeeting.name': 'Create meeting note',

  // ribbon
  'ribbon.openDaily': "Open today's daily note",
  'ribbon.createProject': 'Create project',
  'ribbon.createMeeting': 'Create meeting note',

  // context menu & prompts
  'ctx.createRelatedProject': 'Create related project',
  'prompt.projectName': 'Enter project name',
  'validate.projectName.required': 'Project name cannot be empty',
  'validate.projectName.exists': 'A project or index file already exists; choose a different name',
  'ctx.createRelatedMeeting': 'Create related meeting note',
  'prompt.meetingName': 'Enter meeting name',
  'ctx.addToWeeklyTask': 'Add to weekly tasks',

  // notices
  'notice.projectIndexMissing': 'Project index not found for "{{project}}"; skipped adding meeting link.',

  // common
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'validate.input.required': 'Input cannot be empty',

  // modal: meeting
  'modal.meeting.title': 'Create meeting note',
  'modal.meeting.associateProject': 'Associated project (optional):',
  'modal.meeting.clearSelection': 'Clear selection',
  'validate.meetingName.required': 'Meeting name cannot be empty',

  // headings used in content operations
  'heading.project.meetingNotes': '## Meeting notes',
};

const zh: Dict = {
  // headings
  'title.dailyNotes': '每日笔记参数设置',
  'section.dailyTemplate': '日记模板',
  'section.weeklyTemplate': '周记模板',
  'section.projectTemplate': '项目模板',
  'section.meetingTemplate': '会议记录模板',

  // folder fields
  'field.dailyFolder.name': '日记文件夹路径',
  'field.dailyFolder.desc': '日记文件的存储位置',
  'field.weeklyFolder.name': '周记文件夹路径',
  'field.weeklyFolder.desc': '周记文件的存储位置',
  'field.projectFolder.name': '项目文件夹路径',
  'field.projectFolder.desc': '项目文件的存储位置',
  'field.meetingFolder.name': '会议记录文件夹路径',
  'field.meetingFolder.desc': '会议记录文件的存储位置',

  // auto create
  'field.autoCreate.name': '自动创建日记',
  'field.autoCreate.desc': '每日首次启动时自动创建日记',

  // language field
  'field.language.name': '语言',
  'field.language.desc': '插件使用的语言',
  'language.option.zh': '中文',
  'language.option.en': '英文',

  // reset
  'field.reset.name': '恢复默认设置',
  'field.reset.desc': '将所有设置恢复为初始值',
  'field.reset.button': '恢复默认',

  // placeholders
  'placeholder.dailyFolder': '工作流/日记',
  'placeholder.weeklyFolder': '工作流/周记',
  'placeholder.projectFolder': '工作流/项目',
  'placeholder.meetingFolder': '工作流/会议',
  // commands
  'command.createDaily.name': '创建/打开今日日记',
  'command.createWeekly.name': '创建/打开本周周记',
  'command.createProject.name': '创建项目',
  'command.createMeeting.name': '创建会议记录',

  // ribbon
  'ribbon.openDaily': '打开今日日记',
  'ribbon.createProject': '创建项目',
  'ribbon.createMeeting': '创建会议记录',

  // context menu & prompts
  'ctx.createRelatedProject': '创建关联项目',
  'prompt.projectName': '请输入项目名称',
  'validate.projectName.required': '项目名称不能为空',
  'validate.projectName.exists': '已存在同名项目（或索引文件），请更换名称',
  'ctx.createRelatedMeeting': '创建关联会议记录',
  'prompt.meetingName': '请输入会议名称',
  'ctx.addToWeeklyTask': '添加到每周任务',

  // notices
  'notice.projectIndexMissing': '未找到项目“{{project}}”的索引文件，已跳过追加会议链接。',

  // common
  'common.cancel': '取消',
  'common.confirm': '确认',
  'validate.input.required': '输入不能为空',

  // modal: meeting
  'modal.meeting.title': '创建会议记录',
  'modal.meeting.associateProject': '关联项目（可留空）：',
  'modal.meeting.clearSelection': '清除选择',
  'validate.meetingName.required': '会议名称不能为空',

  // headings used in content operations
  'heading.project.meetingNotes': '## 会议记录',
};

const dict: Record<Locale, Dict> = { en, zh };

export function t(key: string, lang: Locale): string {
  const table = dict[lang] ?? en;
  return table[key] ?? en[key] ?? key;
}