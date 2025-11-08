export interface WorkflowPluginSettings {
    dailyFolder: string;
    weeklyFolder: string;
    projectFolder: string;
    meetingFolder: string;
    autoCreate: boolean;
    autoCreateTime: string;
    dateFormat: string;
    language: string;
    dailyTemplate: string;
    weeklyTemplate: string;
    projectTemplate: string;
    meetingTemplate: string;
}

export const DEFAULT_SETTINGS: WorkflowPluginSettings = {
    dailyFolder: 'workFlow/daily',
    weeklyFolder: 'workFlow/weekly',
    projectFolder: 'workFlow/projects',
    meetingFolder: 'workFlow/meetings',
    autoCreate: true,
    autoCreateTime: '00:00',
    dateFormat: 'YYYY-MM-DD',
    language: 'zh',
    dailyTemplate: `---
tags:
  - daily
  - {{date_year}}-W{{week}}
date: "{{date}}"
week: "W{{week}}"
weekDay: "{{weekday}}"
---

# 每周任务
![[workFlow/weekly/{{date_year}}-w{{week}}#主要任务]]

# 当日工作代办 
{{incomplete_work}}

# 当日个人代办
{{incomplete_personal}} `,
    weeklyTemplate: `---
tags:
  - weekly
  - {{date_year}}-{{date_month}}
  - W{{week}}
---

# 主要任务
`,
    projectTemplate: `---
aliases: 
  - "{{project_name}}"
tags:
  - project
date: "{{date}}"
status: active
---

## 项目资料


## 主要任务


## 相关文件


## 会议记录

`,
    meetingTemplate: `---
tags:
  - meeting
date: "{{date}}"
time: "{{time}}"
links: {{relatedFile}}
---

# {{meeting_name}}

## 会议目标


## 会议内容
1. 
2. 

## 会议决议

`
};

import WorkflowPlugin from '../main'; // 引入你的插件主类

export class SettingsManager {
    constructor(private plugin: WorkflowPlugin) {} // 指定为你的自定义插件类型

    async loadSettings(): Promise<WorkflowPluginSettings> {
        return Object.assign({}, DEFAULT_SETTINGS, await this.plugin.loadData());
    }

    async saveSettings(settings: WorkflowPluginSettings): Promise<void> {
        await this.plugin.saveData(settings);
    }
    
    async resetToDefaults(): Promise<void> {
      this.plugin.settings = {...DEFAULT_SETTINGS}; // 现在 TypeScript 知道 settings 属性存在
      await this.plugin.saveData(this.plugin.settings);
    }
}
