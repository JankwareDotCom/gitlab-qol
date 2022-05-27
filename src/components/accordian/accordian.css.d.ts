declare namespace AccordianCssNamespace {
  export interface IAccordianCss {
    'accordian-content': string;
    'accordian-content-container': string;
    'accordian-content-transition': string;
    'accordian-header': string;
    'accordian-icon': string;
    'accordian-menu-item': string;
    'accordian-title': string;
  }
}

declare const AccordianCssModule: AccordianCssNamespace.IAccordianCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AccordianCssNamespace.IAccordianCss;
};

export = AccordianCssModule;
