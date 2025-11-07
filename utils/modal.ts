import { Modal, App, Notice } from 'obsidian';

export class PromptModal extends Modal {
  private input: HTMLInputElement;
  private resolve: (value: string | null) => void;
  private hintEl: HTMLDivElement;
  private validate?: (value: string) => string | null;

  constructor(
    app: App,
    private message: string,
    private defaultValue: string,
    resolve: (value: string | null) => void,
    validate?: (value: string) => string | null
  ) {
    super(app);
    this.resolve = resolve;
    this.validate = validate;
  }

  onOpen() {
    const { contentEl, titleEl } = this;
    
    titleEl.setText(this.message);
    contentEl.empty();
    
    // 创建内容容器
    const contentContainer = contentEl.createDiv({cls:'sd-modal-content-container'});
    
    this.input = contentContainer.createEl('input',{type:'text',value:this.defaultValue,cls:'sd-modal-input'});
    // 提示文字容器（用于展示校验提示，如重名）
    this.hintEl = contentContainer.createDiv({cls:'sd-modal-hint'});
    const updateHint = () => {
      const msg = this.validate ? this.validate(this.input.value.trim()) : null;
      this.hintEl.setText(msg ?? '');
      if (msg) {
        this.hintEl.addClass('error');
        this.input.addClass('error');
      } else {
        this.hintEl.removeClass('error');
        this.input.removeClass('error');
      }
    };
    this.input.addEventListener('input', updateHint);
    // 初始更新一次提示
    updateHint();
    this.input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.submit();
        }
    });
    
    // 创建按钮区域
    const footerContainer = contentEl.createDiv({cls:'sd-modal-footer-container'});    
    const cancelBtn = footerContainer.createEl('button',{text:'取消',cls:'sd-modal-cancel-btn'});
    cancelBtn.onclick = () => {
      this.resolve(null);
      this.close();
    };
    const confirmBtn = footerContainer.createEl('button',{text:'确定',cls:'sd-modal-confirm-btn'});

    confirmBtn.onclick = () => this.submit();
    this.input.focus();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  private submit() {
    const value = this.input.value.trim();
    if (!value) {
      new Notice('输入不能为空');
      return;
    }
    if (this.validate) {
      const msg = this.validate(value);
      if (msg) {
        // 在输入框下方提示，并阻止提交
        this.hintEl.setText(msg);
        this.hintEl.addClass('error');
        this.input.addClass('error');
        return;
      }
    }
    this.resolve(value);
    this.close();
  }
}


export class MeetingModal extends Modal {
  private nameInput: HTMLInputElement;
  private projectSelect: HTMLSelectElement;
  private resolve: (value: { name: string; project: string | null } | null) => void;
  private hintEl: HTMLDivElement;

  constructor(
    app: App,
    private projects: string[],
    resolve: (value: { name: string; project: string | null } | null) => void
  ) {
    super(app);
    this.resolve = resolve;
  }

  onOpen() {
    const { contentEl, titleEl } = this;
    titleEl.setText('创建会议记录');
    contentEl.empty();

    const container = contentEl.createDiv({ cls: 'sd-modal-content-container' });

    // 会议名称
    this.nameInput = container.createEl('input', { type: 'text', cls: 'sd-modal-input' });
    this.nameInput.placeholder = '请输入会议名称';
    this.hintEl = container.createDiv({ cls: 'sd-modal-hint' });

    // 项目选择（可为空，提供清除按钮）
    const selectLabel = container.createDiv({ cls: 'sd-modal-select-label' });
    selectLabel.setText('关联项目（可留空）：');
    const selectRow = container.createDiv({ cls: 'sd-modal-select-row' });
    this.projectSelect = selectRow.createEl('select', { cls: 'sd-modal-select' });
    this.projects.forEach(p => {
      this.projectSelect.createEl('option', { text: p, value: p });
    });
    // 默认不选中任何项目
    this.projectSelect.selectedIndex = -1;
    const clearBtn = selectRow.createEl('button', { text: '✕', cls: 'sd-modal-select-clear-btn hidden' });
    clearBtn.setAttr('title', '清除选择');
    clearBtn.onclick = () => {
      this.projectSelect.selectedIndex = -1;
      clearBtn.addClass('hidden');
    };
    this.projectSelect.addEventListener('change', () => {
      if (this.projectSelect.selectedIndex >= 0) {
        clearBtn.removeClass('hidden');
      } else {
        clearBtn.addClass('hidden');
      }
    });

    const footer = contentEl.createDiv({ cls: 'sd-modal-footer-container' });
    const cancelBtn = footer.createEl('button', { text: '取消', cls: 'sd-modal-cancel-btn' });
    cancelBtn.onclick = () => { this.resolve(null); this.close(); };
    const confirmBtn = footer.createEl('button', { text: '确定', cls: 'sd-modal-confirm-btn' });
    confirmBtn.onclick = () => this.submit();

    this.nameInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); this.submit(); }
    });
    this.nameInput.focus();
  }

  private submit() {
    const name = this.nameInput.value.trim();
    if (!name) {
      this.hintEl.setText('会议名称不能为空');
      this.hintEl.addClass('error');
      this.nameInput.addClass('error');
      return;
    }
    const project = this.projectSelect && this.projectSelect.selectedIndex >= 0 ? this.projectSelect.value : null;
    this.resolve({ name, project });
    this.close();
  }
}

export class ConfirmModal extends Modal {
  constructor(app: App, private onConfirm: () => void) {
      super(app);
  }

  onOpen() {
      const {contentEl} = this;
      contentEl.setText('确定要恢复所有设置为默认值吗？');
      
      // 创建按钮容器
      const buttonContainer = contentEl.createDiv({cls: 'modal-button-container'});
      
      // 创建取消按钮
      buttonContainer.createEl('button', {text: '取消'}).onclick = () => {
          this.close();
      };
      
      // 创建确认按钮
      buttonContainer.createEl('button', {text: '确认', cls: 'mod-cta'}).onclick = () => {
          this.onConfirm();
          this.close();
      };
  }

  onClose() {
      const {contentEl} = this;
      contentEl.empty();
  }
}