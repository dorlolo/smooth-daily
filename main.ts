import { Plugin, TFile,Menu,MarkdownView,Editor } from 'obsidian';
import { WorkflowPluginSettings, SettingsManager } from './service/settings';
import { FileManager } from './utils/fileManager';
import { DateUtils } from './utils/dateUtils';
import { PromptModal } from './utils/modal';
import { WorkflowSettingTab } from './service/settingTab';
const AddProjectIcon ="target";
const AddMettingIcon ="microphone";
const AddDailyIcon ="calendar";
const AddLinkIcon ="file-symlink";
export default class WorkflowPlugin extends Plugin {
    settings: WorkflowPluginSettings;
    ribbonIconEl: HTMLElement;
    private settingsManager: SettingsManager;
    private fileManager: FileManager;
    private dateUtils: DateUtils;
    private contextMenuListener: (menu: Menu, file: TFile) => void; // 保存文件选择事件监听器引用
    private editorMenuListener:(menu: Menu, editor: Editor, view: MarkdownView) => void;// 保存文件编辑事件监听器引用
    async onload() {
        console.log('loading workflow plugin');
        // 初始化管理类
        this.settingsManager = new SettingsManager(this);
        this.settings = await this.settingsManager.loadSettings();
        this.fileManager = new FileManager(this.app, this.settings);
        this.dateUtils = new DateUtils(this.settings);

        
        this.initRabbotnIcon()
        this.initCommands();
        this.initSettingsTab();
        this.initContextMenu();

        // 检查是否需要自动创建日记
        if (this.settings.autoCreate) {
            this.checkAndCreateDailyNote();
        }
        console.log('workflow plugin loaded');
    }

    onunload() {
        if (this.contextMenuListener) {
            console.log('onunload:remove contextMenuListener')
            this.app.workspace.off('file-menu', this.contextMenuListener);
        }
        console.log('unloading workflow plugin');
    }
    // 初始化命令
    initCommands() {
        // 创建当日日记 
        this.addCommand({
            id: 'create-daily-note',
            name: '创建/打开今日日记',
            callback: () => {
                this.createOrOpenDailyNote();
            }
        });

        // 创建周记
        this.addCommand({
            id: 'create-weekly-note',
            name: '创建/打开本周周记',
            callback: () => {
                this.createOrOpenWeeklyNote();
            }
        });

        // 创建项目
        this.addCommand({
            id: 'create-project-note',
            name: '创建项目',
            checkCallback: (checking: boolean) => {
                // 使用 getLeaf() 替代 activeLeaf
                const leaf = this.app.workspace.getLeaf();
                if (leaf) {
                    if (!checking) {
                        this.createProjectNote();
                    }
                    return true;
                }
                return false;
            }
        });

        // 创建会议记录
        this.addCommand({
            id: 'create-meeting-note',
            name: '创建会议记录',
            checkCallback: (checking: boolean) => {
                // 使用 getLeaf() 替代 activeLeaf
                const leaf = this.app.workspace.getLeaf();
                if (leaf) {
                    if (!checking) {
                        this.createMeetingNote();
                    }
                    return true;
                }
                return false;
            }
        });
    }
    // 初始化Ribbon按钮
    initRabbotnIcon(){
        this.addRibbonIcon(AddDailyIcon, '打开今日日记', () => {
            this.createOrOpenDailyNote();
        });
        this.addRibbonIcon(AddProjectIcon, '创建项目', () => {
            this.createProjectNote();
        });
        // 添加会议内容Ribbon按钮
        this.addRibbonIcon(AddMettingIcon, '创建会议记录', () => {
            this.createMeetingNote();
        });
    }
    // 初始化右键菜单选项
    initContextMenu() {
        if (!this.registerEvent){
            return;
        }
        this.contextMenuListener =(menu, file) => {
            if (file instanceof TFile) {
                // 在日记文件上右键创建相关项目
                if (file.path.startsWith(this.settings.dailyFolder)) {
                    menu.addItem((item) => {
                        item.setTitle('创建关联项目')
                            .setIcon(AddProjectIcon)
                            .onClick(async () => {
                                const projectName = await this.promptUser('请输入项目名称', '', (name: string) => {
                                    if (!name) return '项目名称不能为空';
                                    const folderPath = `${this.settings.projectFolder}/${name}`;
                                    const indexFilePath = `${folderPath}/${name}-index.md`;
                                    const folderExists = !!this.app.vault.getAbstractFileByPath(folderPath);
                                    const fileExists = !!this.app.vault.getAbstractFileByPath(indexFilePath);
                                    if (folderExists || fileExists) {
                                        return '已存在同名项目（或索引文件），请更换名称';
                                    }
                                    return null;
                                });
                                if (projectName) {
                                    this.createProjectNote(projectName, file);
                                }
                            });
                    });

                    menu.addItem((item) => {
                        item.setTitle('创建关联会议记录')
                            .setIcon(AddMettingIcon)
                            .onClick(async () => {
                                const meetingName = await this.promptUser('请输入会议名称');
                                if (meetingName) {
                                    this.createMeetingNote(meetingName, file);
                                }
                            });
                    });
                }

                // 在项目文件上右键创建相关会议
                if (file.path.startsWith(this.settings.projectFolder)) {
                    menu.addItem((item) => {
                        item.setTitle('添加到每周任务')
                            .setIcon(AddLinkIcon)
                            .onClick(async () => {
                                await this.addToWeeklyTask(file, '');
                            });
                    });
                    menu.addItem((item) => {
                        item.setTitle('创建关联会议记录')
                            .setIcon(AddMettingIcon)
                            .onClick(async () => {
                                const meetingName = await this.promptUser('请输入会议名称');
                                if (meetingName) {
                                    this.createMeetingNote(meetingName, file);
                                }
                            });
                    });
                }
            }
        }
        this.editorMenuListener=(menu: Menu, editor: Editor, view: MarkdownView) => {
            const file = view.file;
            if (
              file && 
              file.path.startsWith(this.settings.projectFolder) &&
              view instanceof MarkdownView
            ) {
                const cursor = view.editor.getCursor();
                const lineContent = view.editor.getLine(cursor.line);
                if (lineContent.trim().startsWith("#")) {
                    menu.addItem((item) => {
                        item.setTitle('添加到每周任务')
                        .setIcon(AddLinkIcon)
                        .onClick(() => this.addToWeeklyTask(file, lineContent));
                    });
                }
            }
          }
        // 先移除可能存在的旧监听器（处理热重载场景）
        this.app.workspace.off('file-menu', this.contextMenuListener);
        this.app.workspace.off('editor-menu', this.editorMenuListener);
        // 注册新的事件监听器
        this.app.workspace.on('file-menu', this.contextMenuListener);
        this.app.workspace.on('editor-menu', this.editorMenuListener);

        this.registerDomEvent(document, 'click', (event) => {
            // 查找最近的文件树项目元素
            let target = event.target as HTMLElement;
            while (target && !target.classList.contains('tree-item-self')) {
                if (target.parentElement === null){
                    return;
                }
                target = target.parentElement;
            }
            
            // 如果没找到文件树项目，退出
            if (!target) {
                return;
            }
            
            // 获取路径（确保存在）
            const folderPath = target.dataset.path;
            if (!folderPath) {
                return;
            }
            const parentPath = folderPath.substring(0, folderPath.lastIndexOf('/'));
            if (target.classList.contains('tree-item-self')&&parentPath===this.settings.projectFolder) {
                const folderName = folderPath.substring(folderPath.lastIndexOf('/') + 1);
                const indexFilePath = `${folderPath}/${folderName}-index.md`;
                const indexFile = this.app.vault.getAbstractFileByPath(indexFilePath);
                if (indexFile instanceof TFile) {
                    this.app.workspace.getLeaf(false).openFile(indexFile, { active: false });
                    event.preventDefault();
                    event.stopPropagation();
                    
                    // 阻止默认行为（防止选中目录被取消）
                    // console.log("!target.classList.contains('is-active')",!target.classList.contains('is-active'))
                    // if (!target.classList.contains('is-active')){
                    //     event.preventDefault();
                    //     event.stopPropagation();
                    //     setTimeout(() => {
                    //         // 移除所有文件树项目的选中状态
                    //         document.querySelectorAll('.is-active').forEach(el => {
                    //             el.classList.remove('is-active');
                    //         });
                            
                    //         // 恢复当前目录的选中状态
                    //         target.classList.add('is-active');
                    //     }, 10);
                    // }
                }
            }
        });

    }
    // 初始化设置面板
    initSettingsTab(){
        this.addSettingTab(new WorkflowSettingTab(this.app, this,
            (settings) => this.settingsManager.saveSettings(settings),
            () => this.settingsManager.resetToDefaults()
        ));
    }
    // 检查并创建当日日记
    async checkAndCreateDailyNote() {
        const today = this.dateUtils.getFormattedDate(new Date());
        const dailyNotePath = `${this.settings.dailyFolder}/${today}.md`;
        
        const file = this.app.vault.getAbstractFileByPath(dailyNotePath);
        if (!file) {
            await this.createDailyNote(today);
        }
    }

    // 创建或打开当日日记
    async createOrOpenDailyNote() {
        const today = new Date();
        const dailyNotePath = this.getDailyNotePath(today);
        
        // 检查文件是否已在某个标签页中打开
        const leaf = this.findLeafByPath(dailyNotePath);
        if (leaf) {
            // 如果已打开，切换到该标签页
            this.app.workspace.setActiveLeaf(leaf);
            return;
        }

        // 如果文件不存在，创建它
        let file = this.app.vault.getAbstractFileByPath(dailyNotePath);
        if (!file) {
            file = await this.createDailyNote(this.dateUtils.getFormattedDate(today));
            // 检查并创建相关周记
            await this.ensureWeeklyNoteExists(today);
        }
        if (file instanceof TFile) {
            await this.fileManager.openFile(file);
        }
    }

    findLeafByPath(path: string): any {
        return this.app.workspace.getLeavesOfType('markdown').find(leaf => {
            // 方法 1: 尝试通过 view.file 获取（旧版本 API）
            if (leaf.view instanceof MarkdownView) {
                const file = leaf.view.file;
                if (file && file.path === path) {
                    return true;
                }
            }
        }) || null;
    }

    // 创建当日日记
    async createDailyNote(dateStr: string) {
        // 创建文件夹（如果不存在）
        await this.fileManager.ensureFolderExists(this.settings.dailyFolder);
        
        // 获取日期信息
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const weekNumber = this.dateUtils.getWeekNumber(date);
        const weekday = this.dateUtils.getWeekdayName(date);
        // 查找最近一天（非今日）的日记文件，并提取未完成任务与记录（保持原顺序）
        const latestDailyFile = await this.fileManager.getLatestDailyFileBefore(date);
        let workContent: string[] = [];
        let personalContent: string[] = [];
        if (latestDailyFile) {
            const parsed = await this.fileManager.getSectionContentByType(latestDailyFile.path);
            workContent = parsed.work;
            personalContent = parsed.personal;
        }
        // 生成文件名
        const fileName = `${year}-${month}-${day}_${weekday}.md`;
        const filePath = `${this.settings.dailyFolder}/${fileName}`;
        
        // 生成内容
        let content = this.settings.dailyTemplate;
        content = content.replace(/{{date}}/g, `${year}-${month}-${day}`)
                         .replace(/{{date_year}}/g, `${year}`)
                         .replace(/{{date_month}}/g, `${month}`)
                         .replace(/{{week}}/g, `${weekNumber}`)
                         .replace(/{{weekday}}/g, `${weekday}`);
        // 将内容添加到模板中（保持原顺序）
        const buildSection = (lines: string[]) => lines.join('\n');
        content = content.replace('{{incomplete_work}}', buildSection(workContent));
        content = content.replace('{{incomplete_personal}}', buildSection(personalContent));
        // 创建文件
        const file = await this.app.vault.create(filePath, content);
        
        // 检查并创建周记
        await this.checkAndCreateWeeklyNote(date);
        
        // 打开文件
        await this.fileManager.openFile(file);
        
        return file;
    }

    // 创建或打开本周周记
    async createOrOpenWeeklyNote() {
        const date = new Date();
        const weekNumber = this.dateUtils.getWeekNumber(date);
        const year = date.getFullYear();
        
        const weeklyNotePath = `${this.settings.weeklyFolder}/${year}-w${weekNumber}.md`;
        
        const file = this.app.vault.getAbstractFileByPath(weeklyNotePath);
        if (file instanceof TFile) {
            await this.fileManager.openFile(file);
        } else {
            await this.createWeeklyNote(date);
        }
    }

    // 创建本周周记
    async createWeeklyNote(date: Date) {
        // 创建文件夹（如果不存在）
        await this.fileManager.ensureFolderExists(this.settings.weeklyFolder);
        
        // 获取日期信息
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const weekNumber = this.dateUtils.getWeekNumber(date);
        
        // 生成文件名
        const fileName = `${year}-w${weekNumber}.md`;
        const filePath = `${this.settings.weeklyFolder}/${fileName}`;
        
        // 生成内容
        let content = this.settings.weeklyTemplate;
        content = content.replace(/{{date_year}}/g, `${year}`)
                         .replace(/{{date_month}}/g, `${month}`)
                         .replace(/{{week}}/g, `${weekNumber}`);
        
        // 创建文件
        const file = await this.app.vault.create(filePath, content);
        
        // 打开文件
        await this.fileManager.openFile(file);
        
        return file;
    }

    // 创建项目笔记
    async createProjectNote(projectName?: string|null, relatedFile?: TFile) {
        if (!projectName) {
            projectName = await this.promptUser('请输入项目名称', '', (name: string) => {
                if (!name) return '项目名称不能为空';
                const folderPath = `${this.settings.projectFolder}/${name}`;
                const indexFilePath = `${folderPath}/${name}-index.md`;
                const folderExists = !!this.app.vault.getAbstractFileByPath(folderPath);
                const fileExists = !!this.app.vault.getAbstractFileByPath(indexFilePath);
                if (folderExists || fileExists) {
                    return '已存在同名项目（或索引文件），请更换名称';
                }
                return null;
            });
            if (!projectName) return;
        }
        
        // 创建文件夹（如果不存在）
        await this.fileManager.ensureFolderExists(this.settings.projectFolder+'/'+projectName);
        
        // 获取日期信息
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // 生成文件名和路径
        const fileName = `${projectName}-index.md`;
        const filePath = `${this.settings.projectFolder}/${projectName}/${fileName}`;
        
        // 生成内容
        let content = this.settings.projectTemplate;
        content = content.replace(/{{date}}/g, `${year}-${month}-${day}`)
                         .replace(/{{project_name}}/g, `${projectName}`);
        
        // 如果有相关文件，添加引用
        if (relatedFile && relatedFile.path.startsWith(this.settings.dailyFolder)) {
            const dailyFileName = relatedFile.name;
            content = content.replace('相关日记文件', dailyFileName);
        }
        
        // 创建文件
        const file = await this.app.vault.create(filePath, content);
        
        // 打开文件
        await this.fileManager.openFile(file);
        
        return file;
    }

    // 创建会议记录
    async createMeetingNote(meetingName?: string|null, relatedFile?: TFile) {
        if (!meetingName) {
            meetingName = await this.promptUser('请输入会议名称');
            if (!meetingName) return;
        }
        
        // 创建文件夹（如果不存在）
        await this.fileManager.ensureFolderExists(this.settings.meetingFolder);
        
        // 获取日期和时间信息
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        // 生成文件名和路径
        const fileName = `${year}-${month}-${day}_${meetingName}.md`;
        const filePath = `${this.settings.meetingFolder}/${fileName}`;
        
        // 生成内容
        let content = this.settings.meetingTemplate;
        content = content.replace(/{{date}}/g, `${year}-${month}-${day}`)
                         .replace(/{{time}}/g, `${hours}:${minutes}`)
                         .replace(/{{meeting_name}}/g, `${meetingName}`);
        
        // 如果有相关文件，添加引用
        console.log('relatedFile',relatedFile);
        if (relatedFile) {
            //剔除双引号
            const relatedLink = this.fileManager.generateObsLink(relatedFile);
            content = content.replace(/{{relatedFile}}/g, relatedLink);
        }else{
            content = content.replace(/{{relatedFile}}/g, ``);
        }
        
        // 创建文件
        const file = await this.app.vault.create(filePath, content);
        
        // 打开文件
        await this.fileManager.openFile(file);
        
        return file;
    }

    // 确保周记存在
    async ensureWeeklyNoteExists(date: Date) {
        const year = date.getFullYear();
        const weekNumber = this.dateUtils.getWeekNumber(date);
        const weeklyNotePath = `${this.settings.weeklyFolder}/${year}-w${weekNumber}.md`;
        const file = this.app.vault.getAbstractFileByPath(weeklyNotePath);
        if (!file) {
            await this.createWeeklyNote(date);
        }
    }

    // 检查并创建周记
    async checkAndCreateWeeklyNote(date: Date) {
        const year = date.getFullYear();
        const weekNumber = this.dateUtils.getWeekNumber(date);
        const weeklyNotePath = `${this.settings.weeklyFolder}/${year}-w${weekNumber}.md`;
        const file = this.app.vault.getAbstractFileByPath(weeklyNotePath);
        if (!file) {
            await this.createWeeklyNote(date);
        }
    }
    async addToWeeklyTask(file: TFile, title: string) {
        // 获取当前周的周记路径
        const date = new Date();
        const year = date.getFullYear();
        const weekNumber = this.dateUtils.getWeekNumber(date);
        const weeklyNotePath = `${this.settings.weeklyFolder}/${year}-w${weekNumber}.md`;
        
        // 确保周记存在
        await this.ensureWeeklyNoteExists(date);
        
        // 获取周记文件
        const weeklyNote = this.app.vault.getAbstractFileByPath(weeklyNotePath) ;
        if (!weeklyNote) return;
        
        // 生成任务内容（包含文件链接和标题）
        // const fileLink = this.fileManager.generateObsLink(file); // 生成 [[文件路径]] 格式
        console.log("this.app.metadataCache.fileToLinktext",this.app.metadataCache.fileToLinktext(file,""))
        const fileLinkName = this.app.metadataCache.fileToLinktext(file,"")
        const fileLink=`[[`+fileLinkName+title+`]]`
        console.log('fileLinkName',fileLinkName);
        console.log('fileLink',fileLink);
        console.log('title',title);
        const taskContent = `- ${fileLink}`;
        
        // 读取并修改周记内容（追加到“主要任务”部分）
        if (weeklyNote instanceof TFile){
            
        const content = await this.app.vault.read(weeklyNote);
        const updatedContent = `${content}\n${taskContent}`;
        // 保存修改
        await this.app.vault.modify(weeklyNote, updatedContent);
    }
    }

    // 提示用户输入
    async promptUser(message: string, defaultValue = '', validate?: (value: string) => string | null): Promise<string | null > {
        return new Promise(resolve => {
            const promptModal = new PromptModal(this.app, message, defaultValue, resolve, validate);
            promptModal.open();
        });
    }

    // 获取当日日记路径
    getDailyNotePath(date: Date): string {
        const formattedDate = this.dateUtils.getFormattedDate(date);
        return `${this.settings.dailyFolder}/${formattedDate}.md`;
    }
}
