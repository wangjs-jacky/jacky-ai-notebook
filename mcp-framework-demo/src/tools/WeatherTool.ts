import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface WeatherInput {
  city: string;
}

class WeatherTool extends MCPTool<WeatherInput> {
  name = "weather";
  description = "Get weather information for a city";

  schema = {
    city: {
      type: z.string(),
      description: "City name to get weather for",
    },
  };

  async execute({ city }: WeatherInput) {
    // In a real scenario, this would call a weather API
    // For now, we return this sample data
    return {
      city,
      temperature: 22,
      condition: "Sunny",
      humidity: 45,
    };
  }
}

export default WeatherTool;