export function GetFeatureKey(targetId: string, prefix: string = "feature_"){
    var hash = 0;
    for (var i = 0; i < targetId.length; i++) {
        var char = targetId.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash;
    }
    return prefix + hash;
}