# Video Player

Shows a video from YouTube, Vimeo, Dailymotion and Mp4

## Overview

- **Folder**: `video-player-web`
- **Category**: Images, videos & files
- **Offline capable**: Yes
- **Reference**: [Mendix documentation](https://docs.mendix.com/appstore/widgets/video-player)

## XML Properties

### Data source

- **Type** (`type`; type: enumeration, default: dynamic). Allowed values: `dynamic` (Dynamic), `expression` (Expression).
- **Video URL** (`urlExpression`; type: expression, optional). The web address of the video: YouTube, Vimeo, Dailymotion or MP4. Returns: String.
- **Poster URL** (`posterExpression`; type: expression, optional). The web address of the poster image. A poster image is a custom preview image that will be shown in the player until the user starts the video. Returns: String.
- **Video URL** (`videoUrl`; type: textTemplate, optional). The web address of the video: YouTube, Vimeo, Dailymotion or MP4.
- **Poster URL** (`posterUrl`; type: textTemplate, optional). The web address of the poster image. A poster image is a custom preview image that will be shown in the player until the user starts the video.

### Common

- **Name**. Standard Mendix system property.
- **TabIndex**. Standard Mendix system property.

### Accessibility

- **Title** (`iframeTitle`; type: textTemplate, optional). Describe the purpose of the video (e.g., 'Video tutorial on accessibility').

### Controls

- **Auto start** (`autoStart`; type: boolean, default: false). Automatically start playing the video when the page loads.
- **Show Controls** (`showControls`; type: boolean, default: true). Display video controls (control bar, display icons, dock buttons). Available for YouTube, Dailymotion and external videos.
- **Muted** (`muted`; type: boolean, default: false). Start the video on mute.
- **Loop** (`loop`; type: boolean, default: false). Loop the video after it finishes. Available for YouTube, Vimeo, and external videos.

### Dimensions

- **Width Unit** (`widthUnit`; type: enumeration, default: percentage). Percentage: portion of parent size. Pixels: absolute amount of pixels. Allowed values: `percentage` (Percentage), `pixels` (Pixels).
- **Width** (`width`; type: integer, default: 100).
- **Height unit** (`heightUnit`; type: enumeration, default: aspectRatio). Aspect ratio: ratio of width to height. Percentage of parent: portion of parent height. Percentage of width: portion of the width. Pixels: absolute amount of pixels. Allowed values: `aspectRatio` (Aspect ratio), `percentageOfParent` (Percentage of parent), `percentageOfWidth` (Percentage of width), `pixels` (Pixels).
- **Aspect ratio** (`heightAspectRatio`; type: enumeration, default: sixteenByNine). 16:9 (Widescreen, HD Video), 4:3 (Classic TV, Standard monitor), 3:2 (Classic film), 21:9 (Cinemascope), 1:1 (Square, Social media) Allowed values: `sixteenByNine` (16:9), `fourByThree` (4:3), `threeByTwo` (3:2), `TwentyOneByNine` (21:9), `oneByOne` (1:1).
- **Height** (`height`; type: integer, default: 500).
