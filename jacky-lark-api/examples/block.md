# 如何统计 Lighthouse 得分 

携程短链：`Chrome` 输入 `/thunderwolf`

![img](https://trip.larkenterprise.com/space/api/box/stream/download/asynccode/?code=MjkzOTU4ODUwNzEwYzYwYjdkNDk2NDcwNTc2ZTgwMDZfb292dGlORzVBR3BrajJmT3VUTVFZS0hsekg4ekNzY0lfVG9rZW46U040ZGJxZjFRbzVHbWV4UjFRc2NaQnpFbkdmXzE3NjIzNTg3NDQ6MTc2MjM2MjM0NF9WNA)

# 分析问题

一般我们使用两个工具，分别是 `lighthouse` 以及 `performance`

## Lighthouse

Lighthouse 只是反应一个网站体验的综合指标，并不是性能越好分数越高，里头考虑的点很多。

> 不知道是我不会用还是怎么说，lighthouse 面板中反馈出来的信息没什么头绪，只能作为一个参考，更有用的反而是性能面板，但是特别注意的是 lighthouse 并不等价于 性能。

![img](https://trip.larkenterprise.com/space/api/box/stream/download/asynccode/?code=YTQ5N2YyN2U2OTlmODY1M2Y3N2IxMDJlZGRmZTc1MTJfNTdJMjdTazRDWmlLNWZtWUV1YjlzeW5xY1VjMnNvZG1fVG9rZW46QXVxdGJMUnc4b2tvWVB4d3E2TGNuSE1nblZoXzE3NjIzNTg3NDQ6MTc2MjM2MjM0NF9WNA)

## Performance 面板

### 一、FCP ≈ LCP（本地）✅

在详情页中，在 SSR 渲染阶段，就已经渲染出内容了，最大内容是图片信息，本地看下来两者基本上一致的，这样基本上就没啥太大的问题。

![img](https://trip.larkenterprise.com/space/api/box/stream/download/asynccode/?code=ZTkzYWUyMjY3YmI5YzI4YmI3Zjk1YzgxOGVlZDEzOGJfOExXb09FRzdPaG5iN2JmbUttRjBETUg3NkE2Rm9nMVFfVG9rZW46RVY4UGJIclROb3pFbzF4VnViMWNPbUJJblRmXzE3NjIzNTg3NDQ6MTc2MjM2MjM0NF9WNA)

### 二、网络面板

可以从以下几个方面看图

#### 信息1 ： 资源加载的图形（排队和连接、已发送请求、内容下载、主线程等待）

![img](https://trip.larkenterprise.com/space/api/box/stream/download/asynccode/?code=OTUzYzNmYzk3NTU3YTlmYjliNTMzNzRhNjJiNmZiY2NfUFJNeGNyWm14SXZoekhXcm5tbHlwUGtkcjV3eFJaWGNfVG9rZW46TDViQmJvUzBDb3dYR2t4UGlpWGNSVGZxblFiXzE3NjIzNTg3NDQ6MTc2MjM2MjM0NF9WNA)

> 1. 排队和连接 (Queueing and Connection) - 6.08 ms
>
> 这个阶段是请求在发出前所等待的时间。它通常包含以下子阶段：
>
> - 排队 (Queueing)：浏览器为每个HTTP请求设置了优先级，并且对同一个源（domain）的TCP连接数量有限制（通常是6个）。如果当前的连接数已满，新的请求就需要排队等待。
> - 建立连接 (Connection)：如果之前没有与这个服务器（这里是 `aw-s.tripcdn.com`）建立过连接，还需要花费时间进行TCP三次握手、协商TLS/SSL加密（如果是HTTPS的话）。你这里只花了6ms，说明连接可能被复用了，或者网络条件很好，几乎没有等待。
>
> 1. 已发送请求，正在等待处理 (Request Sent, Waiting for Response) - 67.88 ms
>
> 这个阶段通常被称为 TTFB (Time To First Byte)，即首字节时间。它衡量了从请求发送到服务器，到浏览器接收到服务器返回的第一个数据包之间的时间。这个时间主要包括：
>
> - 网络传输时间：请求从你的电脑传到服务器的时间。
> - 服务器处理时间：服务器收到请求后，处理这个请求（例如，在磁盘上找到这个CSS文件）所花费的时间。这是TTFB的大头。
> - 响应传回时间：服务器生成的响应第一个字节传回你浏览器的时间。
>
> 67.88ms 的TTFB是一个非常好的成绩，说明服务器响应非常迅速，网络延迟也很低。
>
> 1. 内容下载 (Content Download) - 0.36 ms
>
> 这是浏览器从服务器接收响应体数据所花费的时间。时间长短直接取决于文件大小和网络带宽。 这个CSS文件（`fon...eb72cd00784f9d036157b6761.css`）看起来是经过哈希命名的，很可能非常小（可能只有几KB），并且你的网速很快，所以几乎瞬间就下载完成了。
>
> 1. 在主线程上等待 (Waiting in Main Thread) - 0.49 ms
>
> 这个阶段不是网络请求的一部分，而是浏览器内部处理这个资源所花的时间。当下载完成后，资源需要被交给浏览器的主线程进行处理。
>
> - 对于CSS文件，处理包括：解析CSS规则，并将其添加到浏览器的样式规则集中。
> - 这个时间很短，说明CSS文件解析起来很快，没有造成主线程的拥堵。

#### 信息2： 观察资源的加载顺序

可以发现资源和资源加载之前是有顺序的

在 SSR 返回的模板文件中，加载了一个 `link` 标签，其中加载一段 `font` 文件（改文件为框架自带的）

![img](https://trip.larkenterprise.com/space/api/box/stream/download/asynccode/?code=M2Q5MjI1NDBlNDY2NGQyMjFlYTdmYzgxZjEzZjE1MmZfSFhveWtLQUlMVlhvc0V1eXY1THJzaVFTM25jdUFvU0hfVG9rZW46WXNtNmJWdUZKb0tqcnd4UzAxbmNjNDRlbmRjXzE3NjIzNTg3NDQ6MTc2MjM2MjM0NF9WNA)

我们打开这个文件后可以发现，这个 font 中又去加载了其他的字体包文件

![img](https://trip.larkenterprise.com/space/api/box/stream/download/asynccode/?code=MTY1MjVmZTcwNzhiY2Y5N2JhNDYyYjcyYWJjNDliNTVfZzJicTd4SnZVQzN2S1pvRXROeEZaaHVIWGNKYkVWTWxfVG9rZW46U0NGNWJwZ0czb1ZIZGd4Y3MxOWNuSHB6bklnXzE3NjIzNTg3NDQ6MTc2MjM2MjM0NF9WNA)

因此在网络面板中我们可以看到如下资源加载顺序，先加载 `font` → 同时加载了 `TripGeom-Regular/Bold/Medium` 字体包

![img](https://trip.larkenterprise.com/space/api/box/stream/download/asynccode/?code=N2JiYTBlNDA4ZWZkNzE5YjQ1YzVlODQ3N2YyYWY5YzdfUGZtQzN5cmo1a1lKYm9ORUNuUWJaWm9JVHIyODMxRFpfVG9rZW46S2o2R2JIWXhpb3RVU214eG1OY2NEdk1YbnRlXzE3NjIzNTg3NDQ6MTc2MjM2MjM0NF9WNA)

![img](https://trip.larkenterprise.com/space/api/box/stream/download/asynccode/?code=ZDZlZTA1Y2M5Yzg1YmVkZmE2MDE4NGMwYWQ0ZGUyMzRfbUZ6c0sxdEpYRGY0aXBGZWV3R3pJT1I4ckFmQzYyV0lfVG9rZW46WWxaYWJDa29IbzNFT054WHpKV2NaTWdDblVoXzE3NjIzNTg3NDQ6MTc2MjM2MjM0NF9WNA)

我们看下图标库 `crn_font_ttd_mini_page` 会在资源加载后，会肉眼见到一个图标从无到有的过程，说明可以将字体包这个过程提前（使用 preload）

![img](https://trip.larkenterprise.com/space/api/box/stream/download/asynccode/?code=ZWZmN2M2YTE0MTc3ZmEwMTk4YjUyYmQ1YTk4ZTAyMWNfUFVlckp2R2M1ZE1pNFRyZ2NpdmZZSkZxcmR4M0RrNjBfVG9rZW46SGJ2TGJsQ2JWb1Izc0F4Z2p1MmNQYWtYbnliXzE3NjIzNTg3NDQ6MTc2MjM2MjM0NF9WNA)

<video data-lark-video-uri="drivetoken://CFikbdHtYo1Ecmxxmvgcqwyin2e" data-lark-video-mime="video/mp4" data-lark-video-size="2683001" data-lark-video-duration="0" data-lark-video-name="2025-09-10 00.10.13.mp4" data-lark-video-width="1944" data-lark-video-height="1092"></video>

### 三、布局偏移量

通过分析可以发现详情页存在两处偏移，一般偏移的越多得分越低，这一点可以在 lighthouse 中看到

![img](https://trip.larkenterprise.com/space/api/box/stream/download/asynccode/?code=YThjODE2OWM1NjNkMDAwY2U4MDA3OTM3YzBlNThhM2Rfa0N2S0tNaUMwa25CMXR2RlRFZ1duaFBHc1VLWXdyNk9fVG9rZW46THpmcWJGN1Vxb2wyOWN4cUsyZGNQcVJzbjhjXzE3NjIzNTg3NDQ6MTc2MjM2MjM0NF9WNA)

通过 `performance`面板，可以快速定位这两个点。

<video data-lark-video-uri="drivetoken://JAKlbFUFGoDeGjxOHyocRt1FnTe" data-lark-video-mime="video/mp4" data-lark-video-size="5490413" data-lark-video-duration="0" data-lark-video-name="2025-09-10 00.25.21.mp4" data-lark-video-width="2426" data-lark-video-height="1391"></video>

### 四、主进程面板

通过这个面板发现 require 模块的性能

### 五、包体积

主要原因是：xTaro 框架会自动将模块中的 css 文件给注入到 renderHTML 文件中，如果没有使用 XDanimyic 的话，会添加很多额外的内容。

优化前：111 KB，代码函数：27273

优化后：84.9KB，代码行数：19970

差值：26.1KB （76%），行数：-7303

<video data-lark-video-uri="drivetoken://WOZLbIJcHogt1dxhWGacLIKHnKe" data-lark-video-mime="video/mp4" data-lark-video-size="15834110" data-lark-video-duration="0" data-lark-video-name="2025-09-10 00.41.07.mp4" data-lark-video-width="2522" data-lark-video-height="1440"></video>

# 解决方案

### 使用 `preload`

浏览器会在解析 `HTML` 之前会有一个预解析的过程，当资源上存在 `preload` 时就会提前加载。

风险点：如果你错误地 `preload` 了一个非关键资源，它就会以最高优先级去和真正关键的资源（如首屏CSS、渲染必需的JS）竞争网络带宽和TCP连接。这相当于让一个VIP插了真正关键任务的队，可能反而拖慢了整个页面的渲染。

遵循一个核心原则：仅对最最关键的首屏渲染资源使用 `preload`。

### 解决偏移量

1. 原因是服务端样式稍微有一点点问题

<video data-lark-video-uri="drivetoken://AoHwbW6jjoWEQlxAABacHlxFnwf" data-lark-video-mime="video/mp4" data-lark-video-size="15236380" data-lark-video-duration="0" data-lark-video-name="2025-09-10 00.31.00.mp4" data-lark-video-width="2522" data-lark-video-height="1440"></video>

改的方案为

```CSS
.swiper-first-screen .taro-img {
    display: block;
}
```

1. 第二个问题是 XDynamic 时，加载组件时，需要有一个占位高度，注意 h5 中使用 `rem`单位

![img](https://trip.larkenterprise.com/space/api/box/stream/download/asynccode/?code=MzdlY2RjMTY2M2YyMGE5OGNlZmU5OGJiZjk5MTY1MDBfTGc4VnFhZWhyc0g2aTZMemJ4NUpsTXRYQWJGZVdyN0dfVG9rZW46SUJyaGJzZG8xb1RobEl4c1l2dGNmTHBtbjBjXzE3NjIzNTg3NDQ6MTc2MjM2MjM0NF9WNA)