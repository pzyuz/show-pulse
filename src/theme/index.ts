export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    surface: string;
    elevated: string;
    card: string;
    header: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  
  // Border colors
  border: {
    primary: string;
    secondary: string;
    subtle: string;
  };
  
  // Status pill colors
  status: {
    success: {
      background: string;
      text: string;
    };
    warning: {
      background: string;
      text: string;
    };
    danger: {
      background: string;
      text: string;
    };
    neutral: {
      background: string;
      text: string;
    };
  };
  
  // Action colors
  action: {
    primary: {
      background: string;
      text: string;
    };
    secondary: {
      background: string;
      text: string;
    };
    destructive: {
      background: string;
      text: string;
    };
    favorite: {
      background: string;
      text: string;
    };
  };
  
  // UI component colors
  ui: {
    chip: {
      default: {
        background: string;
        text: string;
        border: string;
      };
      selected: {
        background: string;
        text: string;
        border: string;
      };
    };
    toggle: {
      active: {
        background: string;
        text: string;
        border: string;
      };
      inactive: {
        background: string;
        text: string;
        border: string;
      };
    };
    link: {
      background: string;
      text: string;
    };
  };
  
  // Special colors
  special: {
    favorite: string;
    shadow: string;
    overlay: string;
  };
}

export const lightTheme: ThemeColors = {
  background: {
    primary: '#f5f5f5',
    secondary: '#ffffff',
    surface: '#ffffff',
    elevated: '#ffffff',
    card: '#ffffff',
    header: '#F5511E',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    muted: '#999999',
    inverse: '#ffffff',
  },
  border: {
    primary: '#eeeeee',
    secondary: '#e0e0e0',
    subtle: '#f0f0f0',
  },
  status: {
    success: {
      background: '#4caf50',
      text: '#ffffff',
    },
    warning: {
      background: '#ff9800',
      text: '#ffffff',
    },
    danger: {
      background: '#f44336',
      text: '#ffffff',
    },
    neutral: {
      background: '#9e9e9e',
      text: '#ffffff',
    },
  },
  action: {
    primary: {
      background: '#007AFF',
      text: '#ffffff',
    },
    secondary: {
      background: '#f8f8f8',
      text: '#333333',
    },
    destructive: {
      background: '#ff3b30',
      text: '#ffffff',
    },
    favorite: {
      background: '#ffd700',
      text: '#333333',
    },
  },
  ui: {
    chip: {
      default: {
        background: '#f0f0f0',
        text: '#666666',
        border: '#e0e0e0',
      },
      selected: {
        background: '#007AFF',
        text: '#ffffff',
        border: '#007AFF',
      },
    },
    toggle: {
      active: {
        background: '#ffd700',
        text: '#333333',
        border: '#ffd700',
      },
      inactive: {
        background: '#f0f0f0',
        text: '#666666',
        border: '#e0e0e0',
      },
    },
    link: {
      background: '#f0f0f0',
      text: '#333333',
    },
  },
  special: {
    favorite: '#ffd700',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

export const darkTheme: ThemeColors = {
  background: {
    primary: '#121212',
    secondary: '#1e1e1e',
    surface: '#2d2d2d',
    elevated: '#3d3d3d',
    card: '#2d2d2d',
    header: '#F5511E',
  },
  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
    muted: '#808080',
    inverse: '#000000',
  },
  border: {
    primary: '#404040',
    secondary: '#505050',
    subtle: '#353535',
  },
  status: {
    success: {
      background: '#4caf50',
      text: '#ffffff',
    },
    warning: {
      background: '#ff9800',
      text: '#ffffff',
    },
    danger: {
      background: '#f44336',
      text: '#ffffff',
    },
    neutral: {
      background: '#757575',
      text: '#ffffff',
    },
  },
  action: {
    primary: {
      background: '#0A84FF',
      text: '#ffffff',
    },
    secondary: {
      background: '#3d3d3d',
      text: '#ffffff',
    },
    destructive: {
      background: '#ff453a',
      text: '#ffffff',
    },
    favorite: {
      background: '#ffd700',
      text: '#000000',
    },
  },
  ui: {
    chip: {
      default: {
        background: '#3d3d3d',
        text: '#b3b3b3',
        border: '#505050',
      },
      selected: {
        background: '#0A84FF',
        text: '#ffffff',
        border: '#0A84FF',
      },
    },
    toggle: {
      active: {
        background: '#ffd700',
        text: '#000000',
        border: '#ffd700',
      },
      inactive: {
        background: '#3d3d3d',
        text: '#b3b3b3',
        border: '#505050',
      },
    },
    link: {
      background: '#3d3d3d',
      text: '#ffffff',
    },
  },
  special: {
    favorite: '#ffd700',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export const getTheme = (mode: ThemeMode): ThemeColors => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
