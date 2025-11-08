import { App,  PluginSettingTab, Setting } from 'obsidian';
import { WorkflowPluginSettings } from './settings';
import WorkflowPlugin from '../main'; // 引入插件主类
import { ConfirmModal } from '../utils/modal';

export class WorkflowSettingTab extends PluginSettingTab {
    private settings: WorkflowPluginSettings;
    private saveSettings: (settings: WorkflowPluginSettings) => Promise<void>;
    private resetDefaultSettings: () => Promise<void>;
    private plugin: WorkflowPlugin;
    constructor(
        app: App, 
        plugin: WorkflowPlugin, // 接收插件实例
        saveSettings: (settings: WorkflowPluginSettings) => Promise<void>,
        resetDefaultSettings: () => Promise<void>
    ) {
        super(app, plugin); // 传递插件实例给父类
        this.plugin = plugin; // 初始化插件属性
        this.settings = plugin.settings; // 从插件实例获取 settings
        this.saveSettings = saveSettings;
        this.resetDefaultSettings = resetDefaultSettings;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();
        new Setting(containerEl).setName('每日笔记参数设置').setHeading();

        // 文件夹设置
        new Setting(containerEl)
            .setName('日记文件夹路径')
            .setDesc('日记文件的存储位置')
            .addText(text => text
                .setPlaceholder('workFlow/daily')
                .setValue(this.settings.dailyFolder)
                .onChange((value) => {
                    this.settings.dailyFolder = value;
                    void this.saveSettings(this.settings);
                }));

        new Setting(containerEl)
            .setName('周记文件夹路径')
            .setDesc('周记文件的存储位置')
            .addText(text => text
                .setPlaceholder('workFlow/weekly')
                .setValue(this.settings.weeklyFolder)
                .onChange((value) => {
                    this.settings.weeklyFolder = value;
                    void this.saveSettings(this.settings);
                }));

        new Setting(containerEl)
            .setName('项目文件夹路径')
            .setDesc('项目文件的存储位置')
            .addText(text => text
                .setPlaceholder('workFlow/projects')
                .setValue(this.settings.projectFolder)
                .onChange((value) => {
                    this.settings.projectFolder = value;
                    void this.saveSettings(this.settings);
                }));

        new Setting(containerEl)
            .setName('会议记录文件夹路径')
            .setDesc('会议记录文件的存储位置')
            .addText(text => text
                .setPlaceholder('workFlow/meetings')
                .setValue(this.settings.meetingFolder)
                .onChange((value) => {
                    this.settings.meetingFolder = value;
                    void this.saveSettings(this.settings);
                }));

        // 自动创建设置
        new Setting(containerEl)
            .setName('自动创建日记')
            .setDesc('每日首次启动时自动创建日记')
            .addToggle(toggle => toggle
                .setValue(this.settings.autoCreate)
                .onChange((value) => {
                    this.settings.autoCreate = value;
                    void this.saveSettings(this.settings);
                }));

        // 语言设置
        new Setting(containerEl)
            .setName('语言')
            .setDesc('插件使用的语言')
            .addDropdown(dropdown => dropdown
                .addOption('zh', '中文')
                .addOption('en', '英文')
                .setValue(this.settings.language)
                .onChange((value) => {
                    this.settings.language = value;
                    void this.saveSettings(this.settings);
                }));
        new Setting(containerEl)
        .setName('恢复默认设置')
        .setDesc('将所有设置恢复为初始值')
        .addButton(button => button
            .setButtonText('恢复默认')
            .setWarning()
            .onClick(() => {
                new ConfirmModal(this.app, () => {
                    void this.resetDefaultSettings().then(() => {
                        this.settings = this.plugin.settings;
                        this.display();
                    });
                }).open();
            })
        );
        // 模板设置
        new Setting(containerEl).setName('日记模板').setHeading();
        new Setting(containerEl)
            .addTextArea(text => {
                text
                    .setValue(this.settings.dailyTemplate)
                    .onChange((value) => {
                        this.settings.dailyTemplate = value;
                        void this.saveSettings(this.settings);
                    });
                text.inputEl.rows = 10;
                text.inputEl.cols = 50;
            });

        new Setting(containerEl).setName('周记模板').setHeading();
        new Setting(containerEl)
            .addTextArea(text => {
                text
                    .setValue(this.settings.weeklyTemplate)
                    .onChange((value) => {
                        this.settings.weeklyTemplate = value;
                        void this.saveSettings(this.settings);
                    });
                text.inputEl.rows = 10;
                text.inputEl.cols = 50;
            });

        new Setting(containerEl).setName('项目模板').setHeading();
        new Setting(containerEl)
            .addTextArea(text => {
                text
                    .setValue(this.settings.projectTemplate)
                    .onChange((value) => {
                        this.settings.projectTemplate = value;
                        void this.saveSettings(this.settings);
                    });
                text.inputEl.rows = 10;
                text.inputEl.cols = 50;
            });

        new Setting(containerEl).setName('会议记录模板').setHeading();
        new Setting(containerEl)
            .addTextArea(text => {
                text
                    .setValue(this.settings.meetingTemplate)
                    .onChange((value) => {
                        this.settings.meetingTemplate = value;
                        void this.saveSettings(this.settings);
                    });
                text.inputEl.rows = 10;
                text.inputEl.cols = 50;
            });
    }
}
