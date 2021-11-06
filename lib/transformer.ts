import { UserResult, VideoItemResult } from '../types';

export class Transformer {
    static transformUser(u: UserResult) {
        return {
            'id': u.user_info.uid,
            'username': u.user_info.unique_id,
            'avatar': {
                'variants': u.user_info.avatar_thumb.url_list,
                'id': u.user_info.avatar_thumb.uri,
                'properties': {
                    'width': u.user_info.avatar_thumb.width,
                    'height': u.user_info.avatar_thumb.height
                }
            },
            'bio': u.user_info.signature,
            'nick': u.user_info.nickname,
            'verified': Boolean(u.user_info.custom_verify),
            'followers': u.user_info.follower_count,
            'custom_verify': u.user_info.custom_verify
        };
    };

    static transformAuthor(a: VideoItemResult['author']) {
        return {
            'id': a.id,
            'username': a.uniqueId,
            'isPrivate': a.privateAccount,
            'nick': a.nickname,
            'avatar': {
                'thumbnail': a.avatarThumb,
                'medium': a.avatarMedium,
                'large': a.avatarLarge,
            },
            'bio': a.signature,
            'verified': a.verified
        }
    };

    static transformVideo(v: VideoItemResult) {
        return {
            'id': v.id,
            'createdAt': {
                'iso': new Date(v.createTime),
                'date': v.createTime
            },
            'description': v.desc,
            'properties': {
                'video': {
                    'streamUrl': v.video.playAddr,
                    'downloadUrl': v.video.downloadAddr,
                    'quality': v.video.videoQuality,
                    'duration': v.video.duration,
                    'cover': {
                        'photo': v.video.originCover,
                        'animated': v.video.dynamicCover,
                        'share': v.video.shareCover.filter(s => s.length),
                        'reflow': v.video.reflowCover,
                    },
                    'bitrate': v.video.bitrate,
                    'format': v.video.format,
                    'height': v.video.height,
                    'width': v.video.width,
                },
                'audio': {
                    'id': v.music.id,
                    'title': v.music.title,
                    'duration': v.music.duration,
                    'sourceUrl': v.music.playUrl,
                    'cover': {
                        'thumbnail': v.music.coverThumb,
                        'medium': v.music.coverMedium,
                        'large': v.music.coverLarge,
                    },
                    'author': v.music.authorName,
                    'isOriginal': v.music.original,
                    'album': v.music.album.length ? v.music.album : '-',
                },
                'author': {
                    ...this.transformAuthor(v.author),
                    'stats': v.authorStats,
                },
                'stats': v.stats,
                'stickers': v.stickersOnItem,
                'extra': v.textExtra,
            }
        };
    }
}