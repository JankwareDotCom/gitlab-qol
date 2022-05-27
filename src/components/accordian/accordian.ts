import Define, { CustomHTMLElement } from '../../utilities/CustomElementHelper';
import s from './accordian.css';

export class Accordian extends CustomHTMLElement {
  allowMultipleExpansion = false;
  initialize(
    content: { title: string | HTMLElement; content: string | HTMLElement }[],
    props: AccordianProps | null = null,
  ) {
    if (props?.Id) {
      this.id = props.Id;
    }

    if (props?.Class) {
      this.className = props.Class;
    }

    if (props?.Style) {
      this.setAttribute('style', props.Style);
    }

    this.allowMultipleExpansion = props?.AllowMultipleExpansion ?? false;

    content.forEach((e) => {
      const menuItem = new AccordianMenuItem();
      menuItem.initialize(e.title, e.content, this.allowMultipleExpansion);
      this.append(menuItem);
    });
  }
}

class AccordianMenuItem extends CustomHTMLElement {
  _header?: AccordianMenuItemHeader;
  _content?: AccordianMenuItemContent;

  initialize(title: string | HTMLElement, content: string | HTMLElement, allowMultipleExpansion: boolean) {
    this.classList.add(s['accordian-menu-item']);

    this._header = new AccordianMenuItemHeader();
    this._header.initialize(title);

    this._content = new AccordianMenuItemContent();
    this._content.initialize(this._header, content, allowMultipleExpansion);

    this.append(this._header, this._content);
  }
}

class AccordianMenuItemHeader extends CustomHTMLElement {
  readonly _title = document.createElement('div');
  readonly _icon = document.createElement('div');

  initialize(title: string | HTMLElement) {
    this.classList.add(s['accordian-header']);

    this._title.classList.add(s['accordian-title']);
    this._title.append(title);

    this._icon.classList.add(s['accordian-icon']);
    this._icon.append('+');

    this.append(this._title, this._icon);
  }
}

class AccordianMenuItemContent extends CustomHTMLElement {
  _contentContainer = document.createElement('div');
  initialize(header: AccordianMenuItemHeader, content: string | HTMLElement, allowMultipleExpansion: boolean) {
    this._contentContainer.append(content);
    this._contentContainer.classList.add(s['accordian-content-container']);
    this.classList.add(s['accordian-content']);
    this.append(this._contentContainer);

    header.addEventListener('click', () => {
      const nowHidden = this.getBoundingClientRect().height > 0;
      header._icon.innerText = nowHidden ? '+' : '-';
      if (!allowMultipleExpansion && !nowHidden) {
        const grandparentElement = this.parentElement?.parentElement;
        const accordianContents = grandparentElement?.getElementsByClassName(s['accordian-content']);
        Array<Element>()
          .slice.call(accordianContents)
          .forEach((e) => {
            if (e !== this) {
              e.classList.remove(s['accordian-content-transition']);
              Array<Element>()
                .slice.call(e.parentElement?.getElementsByClassName(s['accordian-icon']))
                .forEach((e2) => (e2.innerHTML = '+'));
            }
          });
      }

      this.classList.toggle(s['accordian-content-transition']);
    });
  }
}

class AccordianProps {
  Id?: string;
  Class?: string;
  Style?: string;
  AllowMultipleExpansion = false;
}

Define('accordian-menu', Accordian);
Define('accordian-menu-item', AccordianMenuItem);
Define('accordian-menu-item-header', AccordianMenuItemHeader);
Define('accordian-menu-item-content', AccordianMenuItemContent);
