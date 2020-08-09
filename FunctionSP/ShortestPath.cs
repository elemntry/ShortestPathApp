using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using ShortestPathAlgos;
using System.Collections.Generic;
using System.Linq;

namespace FunctionSP
{
    public static class ShortestPath
    {
        [FunctionName("FindShortestPath")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)]
            HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");
            //read stream and write into string 
            string request = await new StreamReader(req.Body).ReadToEndAsync();
            //check to right Json format and then get Json Object
            JsonDocument data = JsonDocument.Parse(request);
            JsonElement root = data.RootElement;

            //create graph

            List<Node> nodes = new List<Node>();
            foreach (var el in root.GetProperty("graph").GetProperty("nodes").EnumerateArray())
            {
                nodes.Add(new Node<string>(el.GetProperty("id").GetString()));
            }

            //create edges
            List<Edge> edges = new List<Edge>();
            foreach (var el in root.GetProperty("graph").GetProperty("edges").EnumerateArray())
            {
                string from = el.GetProperty("from").GetString();
                string to = el.GetProperty("to").GetString();
                int weight = el.TryGetProperty("weight", out var trueWeight) ? trueWeight.GetInt32() : 1;

                edges.Add(new Edge(nodes[nodes.FindIndex(node => node.Payload == from)],
                    nodes[nodes.FindIndex(node => node.Payload == to)], weight));
            }

            var directed = root.GetProperty("graph").GetProperty("directed").GetBoolean();
            //create graph
            Graph graph = new Graph(nodes, edges, directed);

            //init node Start and End
            var startEndNode = root.GetProperty("graph").TryGetProperty("selectedNodes", out var endNode1);
            var selectedNodes = endNode1.EnumerateArray().Select(el => el.GetString()).ToArray();
            var startNode = selectedNodes[0];
            var endNode = selectedNodes[1];
            //find shortest Path
            Dijkstra path = new Dijkstra(graph, graph.Nodes[graph.Nodes.FindIndex(node => node.Payload == startNode)]);
            path.FindShortestPath();
            //prepare to return object
            //json graph spec
            //https://github.com/jsongraph/json-graph-specification
            //return (ActionResult)new OkObjectResult(JsonSerializer.Serialize<int[]>(path.Dist));
            // or 
            //return new JsonResult(path.Dist);            
            //return (ActionResult)new OkObjectResult(System.Text.Json.JsonSerializer.Serialize<int[]>(path.Dist));
            return new JsonResult(path.Dist);
        }
    }
}