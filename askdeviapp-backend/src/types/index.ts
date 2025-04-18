export interface BirthDetails {
    date: string;
    time: string;
    location: {
      latitude: number;
      longitude: number;
    };
  }
  
  export interface AstrologyAPIRequest {
    day: number;
    month: number;
    year: number;
    hour: number;
    min: number;
    lat: number;
    lon: number;
    tzone: number;
  }
  
  export interface ChatMessage {
    id: string;  // Frontend-only field for React keys
    content: string;
    role: 'user' | 'assistant';
  }
  
  interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string;
    };
    type: 'function';
  }
  
  export interface GPTMessage {
    content: string | null;
    role: 'system' | 'user' | 'assistant' | 'tool';
    name?: string;
    tool_calls?: ToolCall[];  // Optional
    tool_call_id?: string;    // Optional
  }
  
  
  export interface User {
    _id?: string;
    userId: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    gender: 'female' | 'male' | 'other';
    preferredLanguage: 'hinglish' | 'english';
    birthDate: string;
    birthTime: string;
    birthPlace: {
      name: string;
      latitude: number;
      longitude: number;
    };
    relationshipStatus: 'single' | 'dating' | 'married' | 'other';
    occupation: 'employed' | 'self-employed' | 'homemaker' | 'student' | 'other';
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface MatchDetails {
    male: {
      date: string;
      time: string;
      location: {
        latitude: number;
        longitude: number;
      };
    };
    female: {
      date: string;
      time: string;
      location: {
        latitude: number;
        longitude: number;
      };
    };
  }
  
  export interface MatchAPIRequest {
    m_day: number;
    m_month: number;
    m_year: number;
    m_hour: number;
    m_min: number;
    m_lat: number;
    m_lon: number;
    m_tzone: number;
    f_day: number;
    f_month: number;
    f_year: number;
    f_hour: number;
    f_min: number;
    f_lat: number;
    f_lon: number;
    f_tzone: number;
  }
  